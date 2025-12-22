function setupBannerCve() {
    // Setup actions in banner
    const onFocusCve = e => {
        const port = parseInt(e.target.parentElement.dataset.port);
        const rank = e.target.dataset.rank;
        highlightCveRank(port, rank);
    }

    const onShowAll = e => e.target.parentElement.dataset.showAll = true;

    document.querySelectorAll('.cve-tag-show-all').forEach($elm => $elm.addEventListener('click', onShowAll));
    document.querySelectorAll('.cve-tag:not(.cve-tag-show-all)').forEach($elm => $elm.addEventListener('click', onFocusCve));
}

function setupVulns(vulns) {
    const $filterBy = document.getElementById('vulns-filter-by');
    const $sortBy = document.getElementById('vulns-sort-by');

    const onChange = () => renderVulnsTable(vulns, $filterBy.value, $sortBy.value);

    $filterBy.addEventListener('change', onChange);
    $sortBy.addEventListener('change', onChange);

    onChange();
}

function renderVulnsTable(vulns, filterBy, sortBy) {
    let filtered = [];

    let filterPort = 0;
    if (filterBy !== 'all') {
        filterPort = parseInt(filterBy);
    }

    for (const name in vulns) {
        if (filterBy === 'all' || vulns[name]['ports'].indexOf(filterPort) > -1) {
            filtered.push(name);
        }
    }

    // Sort list if needed
    if (sortBy === 'score') {
        filtered = filtered.sort((nameA, nameB) => vulns[nameA].cvss >= vulns[nameB].cvss ? -1 : 1);
    }

    // Clear content
    const $table = document.getElementById('vulns-table');
    $table.innerHTML = '';

    // Render table
    $fragment = document.createDocumentFragment();

    let currentGroup = '';
    let $yearRow;

    let $count;
    let count = 0;

    const onAnimationEnd = e => e.target.classList.remove('vuln-highlight');

    for (const name of filtered) {
        let cvss = vulns[name]['cvss'];
        let ranking = 'Unscored';
        let rankingIcon = 'fa-thermometer-empty';
        let color = '';

        if (cvss >= 9) {
            color = 'bg-danger';
            ranking = 'Critical';
            rankingIcon = 'fa-thermometer-full';
        } else if (cvss >= 7) {
            color = 'bg-warning';
            ranking = 'High';
            rankingIcon = 'fa-thermometer-three-quarters';
        } else if (cvss >= 4) {
            color = 'bg-info';
            ranking = 'Medium';
            rankingIcon = 'fa-thermometer-half';
        } else if (cvss > 0) {
            ranking = 'Low';
            rankingIcon = 'fa-thermometer-quarter';
        }

        if (sortBy === 'date') {
            const cveYear = name.split('-')[1];
            if (cveYear !== currentGroup) {
                // Update count of the previous group
                $count && ($count.textContent = `(${count})`);
                count = 0;

                currentGroup = cveYear;
                $yearRow = createElement('div', { class: 'vuln-title-row text-dark' },
                    createElement('i', { class: 'far fa-calendar-alt fa-fw' }),
                    currentGroup,
                    $count = createElement('span', { class: 'text-secondary' }),
                );
                $fragment.appendChild($yearRow);
            }
        } else if (sortBy === 'score') {
            if (ranking !== currentGroup) {
                // Update count of the previous group
                $count && ($count.textContent = `(${count})`);
                count = 0;count.textContent = `(${count})`;

                currentGroup = ranking;
                $rankingRow = createElement('div', {
                    class: 'vuln-title-row text-dark',
                    id: `cve-${filterPort}-${ranking.toLowerCase()}`,
                },
                    createElement('i', { class: `far ${rankingIcon} fa-fw` }),
                    currentGroup,
                    $count = createElement('span', { class: 'text-secondary' }),
                );
                $fragment.appendChild($rankingRow);
            }
        }

        count += 1;
        if (cvss && cvss !== 10) {
            cvss = cvss.toFixed(1);
        }

        const $row = createElement('div', { class: 'vuln-row', id: name },
            createElement('a', {
                class: 'text-dark',
                href: `/search?query=vuln:${name}`,
            }, name),
            createElement('div', {},
                !!cvss && createElement('span', { class: `tag ${color}` }, cvss),
                createElement('span', {}, vulns[name]['summary']),
            ),
        );

        $row.addEventListener('animationend', onAnimationEnd);
        $fragment.appendChild($row);
    }

    $count && ($count.textContent = `(${count})`);
    $table.appendChild($fragment);
}

function scrollToCveRank(port, rank) {
    const $elm = document.getElementById(`cve-${port}-${rank}`);
    if ($elm) {
        $elm.scrollIntoView();
        $elm.classList.add('vuln-highlight');
    }
}

function highlightCveRank(port, rank) {
    const $filterBy = document.getElementById('vulns-filter-by');
    const $sortBy = document.getElementById('vulns-sort-by');

    port = port.toString();
    if ($filterBy.value !== port || $sortBy !== 'score') {
        $filterBy.value = port;
        $sortBy.value = 'score';

        $filterBy.dispatchEvent(new Event('change'));
        setTimeout(() => scrollToCveRank(port, rank), 100);
    } else {
        scrollToCveRank(port, rank);
    }
}

function toggleHashesTable(e) {
    const $target = e.target;
    const $parent = $target.closest('h6');
    if (!$parent) {
        return;
    }

    const $card = $parent.nextElementSibling;
    const $hashesTable = $card.querySelector('.hashes-table');
    if ($hashesTable) {
        $hashesTable.style.display = $hashesTable.style.display === 'block' ? 'none' : 'block';
    }
}

function setupHashesTables() {
    document.querySelectorAll('h6.grid-heading a.bg-success').forEach($elm => $elm.addEventListener('click', toggleHashesTable));
}
