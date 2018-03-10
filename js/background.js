var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

// for Firefox
if (isFirefox) {
    browser.browserAction.onClicked.addListener(
        function () {
            var url = browser.runtime.getURL('index.html');
            browser.tabs.create({
                url: url
            });
        }
    );
} else {
    // for Chrome
    chrome.browserAction.onClicked.addListener(
        function () {
            var url = chrome.runtime.getURL('index.html');
            chrome.tabs.create({
                url: url
            });
        }
    );
}
