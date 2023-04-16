function injectScript(src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.type = "module"
    s.onload = function () {
        this.remove();
    };

    (document.head || document.documentElement).appendChild(s);

}

injectScript('inject/main.js')