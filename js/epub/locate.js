var tocURLs = [];

function getTocURLs(chapters) {
    chapters.forEach(function (item) {
        tocURLs.push(item.href);
        if (item.subitems && item.subitems.length) {
            getTocURLs(item.subitems);
        }
    });
}

// 修正页面竖直滚动模式下的页面内链接跳转问题
function locate(e) {
    var book = window.parent.book,
        self = this,
        href,
        lastSeparator,
        anchor,
        item,
        i;

    href = self.href;
    lastSeparator = href.lastIndexOf('/');
    href = href.substring(lastSeparator + 1, href.length);

    if (!href)
        return;

    if (href.indexOf('#') !== -1) {
        anchor = href.split('#')[1];
        href = href.split('#')[0];
    }

    for (i = 0; i < tocURLs.length; i++) {
        item = tocURLs[i];
        if (item.indexOf(href) !== -1) {
            book.goto(item).then(function () {
                if (anchor)
                    window.parent.pageYScrollTo(anchor);
            });
            return false;
        }
    }
}

function bindEvent() {
    var a = document.getElementsByTagName('a');

    getTocURLs(window.parent.book.toc);

    a = Array.prototype.slice.call(a, 0);
    a.forEach(function (e) {
        e.onclick = locate;
    });
}

bindEvent();