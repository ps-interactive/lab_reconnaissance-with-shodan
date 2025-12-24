// Quickly create a tree of elements without having to use innerHTML
function createElement(elmName, props) {
    const $elm = document.createElement(elmName);

    props = props || {};
    for (const key in props) {
        if (!$elm.hasOwnProperty(key)) {
            $elm.setAttribute(key, props[key]);
        }
    }

    for (let i = 2, size = arguments.length; i < size; i++) {
        const arg = arguments[i];

        if (arg instanceof Node) {
            $elm.appendChild(arg);
        } else if (typeof arg !== 'undefined') {
            $elm.appendChild(document.createTextNode(arg));
        }
    }

    return $elm;
}

window.CE = createElement;

function copyToClipboard($elm) {
    // API requires a secure origin
    if (!navigator.clipboard) {
        return;
    }

    const text = $elm.dataset.clipboard;
    if (!text) {
        return;
    }

    return navigator.clipboard.writeText(text).then(() => {
        $elm.timeoutId && clearTimeout($elm.timeoutId);
        $elm.timeoutId = null;

        $elm.ariaLabel = 'Copied!';
    }, err => {
        console.error(err);
        $elm.ariaLabel = 'Could not copy text to clipboard!';
    }).finally(function() {
        // Clear tooltip
        $elm.timeoutId = setTimeout(() => $elm.removeAttribute('aria-label'), 1000);
    });
}
