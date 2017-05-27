var book = null;

// 进入页面后的一系列初始化操作
function init() {
    var key = document.cookie.split(';')[0].split('=')[1]; // 获取存储在 cookie 中的当前阅读书籍的 key
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

                // 生成目录
                book.getToc().then(function (toc) {
                    var ul = generateToc(toc, false);
                    document.getElementsByClassName('toc')[0].appendChild(ul);
                });

                // 设置样式
                book.setStyle('user-select', 'none'); // 禁用文字选择
                book.setStyle('background-color', 'transparent'); // 背景透明

                // 渲染
                book.renderTo(page);
            },
            function () {
                alert('获取书籍信息失败，请返回首页重试！');
            }
        );
    });
}

// 生成目录
function generateToc(chapters, collapse) {
    var ul = document.createElement('ul'),
        li,
        str = '<div class="item-content"><i class="item-mark"></i><a class="chapter-url" href="{url}">{label}</a></div>',
        itemContent;

    ul.className = collapse ? 'chapter-list collapse' : 'chapter-list expand';
    ul.style.height = collapse ? '0' : '';

    chapters.forEach(function (item) {
        li = document.createElement('li');
        li.className = 'chapter-list-item';
        itemContent = str.replace('{url}', item.href)
            .replace('{label}', item.label);
        li.innerHTML = itemContent;
        ul.appendChild(li);

        // 若章节还有子章节，递归生成目录（默认目录折叠）
        if (item.subitems && item.subitems.length) {
            li.appendChild(generateToc(item.subitems, true));
        }
    });

    return ul;
}

// 目录列表中每个章节的事件处理程序（事件委托）
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

// 章节折叠的事件处理程序（事件委托）
document.getElementsByClassName('toc')[0]
    .addEventListener('click', function (e) {
        var target= e.target;
        if (target && target.className.indexOf('item-mark') !== -1) {
            var subChapList = target.parentNode.nextElementSibling;
            if (subChapList && subChapList.className.indexOf('chapter-list') !== -1) {
                // IE 不支持此方法
                if (subChapList.classList.contains('collapse')) {
                    subChapList.classList.remove('collapse');
                    subChapList.classList.add('expand');
                    subChapList.style.height = getListHeight(subChapList) + 'px';
                } else {
                    subChapList.classList.remove('expand');
                    subChapList.classList.add('collapse');
                    subChapList.style.height = '0';
                }
                e.preventDefault();
            }
        }
    });

// 计算被隐藏的章节列表本来的高度元素的高度
function getListHeight(element) {
    var e,
        height = 0,
        i,
        style;
    for (i = 0; i < element.childNodes.length; i++) {
        e = element.childNodes[i];
        if (e.nodeType === 1) {
            style = e.currentStyle || document.defaultView.getComputedStyle(e, null); // 使用计算样式获取元素高度
            height += parseFloat(style.height);
        }
    }
    return height;
}

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

// 添加此段代码使支持翻页动画
EPUBJS.Render.Iframe.prototype.setLeft = function(leftPos){
    this.docEl.style[this.transform] = 'translate('+ (-leftPos) + 'px, 0)';
};

window.onload = function () {
    init();
};
