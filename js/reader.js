var book = null;

// 进入页面后的一系列初始化操作
function init() {
    var key = document.cookie.split(';')[0].split('=')[1];
    console.log(key);

    bookDB.open(function () {
        bookDB.getBook(
            key,
            function (result) {
                var page = document.getElementsByClassName('page')[0];
                var option = {
                    bookPath: result.content,
                    restore: true
                };
                book = ePub(option);

                book.getToc().then(function (toc) {
                    var ul = generateToc(toc);
                    document.getElementsByClassName('toc')[0].appendChild(ul);
                });

                book.setStyle('user-select', 'none');

                book.renderTo(page);
            },
            function () {
                alert('获取书籍信息失败，请返回首页重试！');
            }
        );
    });
}

// 生成目录
function generateToc(chapters) {
    var ul = document.createElement('ul'),
        li,
        str = '<div class="item-content"><i class="item-mark"></i><a class="chapter-url" href="{url}">{label}</a></div>',
        itemContent;

    ul.className = 'chapter-list';

    chapters.forEach(function (item) {
        li = document.createElement('li');
        li.className = 'chapter-list-item';
        itemContent = str.replace('{url}', item.href)
            .replace('{label}', item.label);
        li.innerHTML = itemContent;
        ul.appendChild(li);

        if (item.subitems && item.subitems.length) {
            li.appendChild(generateToc(item.subitems));
        }
    });

    return ul;
}

// 目录列表中每个章节的事件处理程序
document.getElementsByClassName('toc')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeName.toLocaleLowerCase() === 'a' && target.className.indexOf('chapter-url') !== -1) {
            var href = target.getAttribute('href');
            book.goto(href);
            e.preventDefault();
            console.log(href);
        }
    });

// 翻页快捷键的事件处理程序
EPUBJS.Hooks.register("beforeChapterDisplay").pageTurns = function (callback, renderer) {
    var lock = false;
    var arrowKeys = function (e) {
        e.preventDefault();
        if (lock) return;

        if (e.keyCode == 37 || e.keyCode == 38) {
            book.prevPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }

        if (e.keyCode == 39 || e.keyCode == 40) {
            book.nextPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }

    };
    renderer.doc.addEventListener('keydown', arrowKeys, false);
    if (callback) callback();
};

// 添加翻页动画
EPUBJS.Hooks.register('beforeChapterDisplay').pageAnimation = function (callback, renderer) {
    window.setTimeout(function () {
        var style = renderer.doc.createElement("style");
        style.innerHTML = "*{-webkit-transition: transform {t} ease;-moz-transition: tranform {t} ease;-o-transition: transform {t} ease;-ms-transition: transform {t} ease;transition: transform {t} ease;}";
        style.innerHTML = style.innerHTML.split("{t}").join("0.5s");
        renderer.doc.body.appendChild(style);
    }, 100);
    if (callback) {
        callback();
    }
};

EPUBJS.Render.Iframe.prototype.setLeft = function(leftPos){
    this.docEl.style[this.transform] = 'translate('+ (-leftPos) + 'px, 0)';
};

window.onload = function () {
    init();
};
