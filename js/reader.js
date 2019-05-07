var book = null; // 书籍
var bookMarkFlag = false; // 标记：是否可以开始书签跳转了
var anchorFlag = false; // 标记：是否可以开始判断锚点位置以定位
var copyText = ''; // 复制的文本内容

var tocSide = {
    isVisible: false
};

Object.defineProperty(tocSide, 'visible', {
    set: function (val) {
        this.isVisible = val;
        var main = document.getElementsByTagName('main')[0];
        val ? main.classList.add('toc-on') : main.classList.remove('toc-on');
    }
});

function getStyle(element, property) {
    return getComputedStyle(element, null).getPropertyValue(property);
}

function $(selector) {
    return document.querySelectorAll(selector);
}

function $$(selector) {
    return document.querySelector(selector);
}

function nodeListToArray(nodes) {
    return Array.prototype.slice.call(nodes, 0);
}

// 进入页面后的一系列初始化操作
function init() {
    var key = localStorage.getItem('reading');  // 获取存储在 localStorage 中的当前阅读书籍的 key
    console.log(key);

    bookDB.open(function () {
        bookDB.getBook(
            key,
            function (result) {
                var page = document.getElementsByClassName('page')[0];
                var option = {
                    bookPath: result.content,
                    restore: false
                };
                book = ePub(option);

                // 生成目录
                book.getToc().then(function (toc) {
                    var ul = generateToc(toc, false);
                    ul.classList.add('root-list'); // 'root-list' 用于标记根列表
                    document.getElementsByClassName('toc')[0].appendChild(ul);
                    setCollapseStyle(); // 设置折叠的样式
                });

                // 设置样式
                book.setStyle('background-color', 'transparent'); // 背景透明

                // 设置背景色
                var bgColor = localStorage.getItem('bg-color');
                bgColor && setColor(bgColor, 'background');

                // 设置字体色
                var fontColor = localStorage.getItem('font-color');
                fontColor && setColor(fontColor, 'font');

                // 设置高亮色
                var hlColor = localStorage.getItem('hl-color');
                hlColor && setColor(hlColor, 'highlight');

                // 根据设置确定按钮内容
                document.getElementById('toggle-popup').textContent = QiuSettings.popup ? 'enabled' : 'disabled';

                // 设置单页或者双页
                book.renderer.forceSingle(QiuSettings.forceSingle);

                // 渲染
                book.renderTo(page);

                var initializing = true; // TODO 更好的方式？
                var pos;

                // 跳转到上一次阅读点
                if (currentLocation.getCurrentLocation()) {
                    pos = currentLocation.getCurrentLocation();
                    book.gotoCfi(pos.cfi);
                }

                // 设置边距
                setMargins();

                // 用户自定义设置
                book.on('renderer:chapterDisplayed', function () {
                    if (initializing) {
                        tocSide.visible = QiuSettings.sideToc;
                        QiuSettings.pageMode ? setHorizontalMode(QiuSettings.forceSingle) : setVerticalMode();
                        setStyle();
                        if (!QiuSettings.pageMode && currentLocation.getCurrentLocation() && currentLocation.getCurrentLocation().posY) {
                            setYScroll(currentLocation.getCurrentLocation().posY);
                        }
                        initializing = false;
                    } else {
                        QiuSettings.pageMode ? setHorizontalMode(QiuSettings.forceSingle) : setVerticalMode();
                        setStyle();
                        bookMarkFlag = true;
                        anchorFlag = true;
                    }

                    setTimeout(function () {
                        // 在tocSide.visible已经设置为用户定义的状态之后再允许动画效果，避免出现toc栏闪动动画
                        document.getElementsByTagName('main')[0].classList.add('with-animation');
                    }, 500);

                    var indexNum = window.location.href.lastIndexOf('/');
                    var pageUri = window.location.href.substring(0, indexNum);
                    var link = createLink(pageUri + '/css/epub/common.css');
                    var script = createScript(pageUri + '/js/epub/selection.js');
                    var iframe = document.getElementsByTagName('iframe')[0];
                    iframe.contentDocument.head.appendChild(link);
                    iframe.contentDocument.body.appendChild(script);
                });

                // 监听进度变化，记录进度信息
                book.on('renderer:locationChanged', function (locationCfi) {
                    if (!initializing) // 避免初始化时覆盖历史阅览进度
                        currentLocation.recordCurrentLocation(); // 记录当前阅读进度
                });
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
            var previousHref = book.renderer.currentChapter.href;

            if (href.indexOf('#') !== -1 && previousHref.indexOf(href.split('#')[0]) !== -1) { // 说明页面未切换，直接用锚点定位
                QiuSettings.pageMode ? book.goto(href) : pageYScrollTo(href.split('#')[1]); // 垂直滚动模式下需要定位到锚点位置
            } else {
                book.goto(href).then(function () {
                    if (href.indexOf('#') !== -1 && QiuSettings.pageMode === false) {
                        setTimeout(function () { // todo 让样式表生效后计算正确高度，能否优化？
                            if (anchorFlag) {
                                pageYScrollTo(href.split('#')[1]);
                                anchorFlag = false;
                            } else {
                                setTimeout(arguments.callee, 10);
                            }
                        }, 10);
                    }
                });
            }

            e.preventDefault();
            console.log(href + " " + currentLocation.getCurrentLocation());
        }
    });

// 章节折叠的事件处理程序（事件委托）
document.getElementsByClassName('toc')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.className.indexOf('item-mark') !== -1) {
            var subChapList = target.parentNode.nextElementSibling;
            if (subChapList && subChapList.className.indexOf('chapter-list') !== -1) {
                // IE 不支持classList
                if (subChapList.classList.contains('collapse')) {
                    subChapList.classList.remove('collapse');
                    subChapList.classList.add('expand');
                    changeHeight(subChapList, false);
                } else {
                    subChapList.classList.remove('expand');
                    subChapList.classList.add('collapse');
                    changeHeight(subChapList, true);
                }
                e.preventDefault();
                setCollapseStyle(); // 设置折叠样式
            }
        }
    });

// 计算被隐藏的章节列表本来的高度元素的高度
function getListHeight(element) {
    var e,
        height = 0,
        i,
        dataHeight;
    for (i = 0; i < element.childNodes.length; i++) {
        e = element.childNodes[i]; // e 为 ul 下的 li 元素
        if (e.nodeType === 1) {
            dataHeight = e.getAttribute('data-height');
            height = dataHeight ? (height + parseFloat(dataHeight)) : (height + e.offsetHeight);
        }
    }
    return height;
}

// 目录列表展开或折叠时改变其高度
// 第二个参数为true则折叠，false则展开
function changeHeight(element, collapse) {
    element.style.height = collapse ? '0' : (getListHeight(element) + 'px');

    // 下面的代码是为了解决由于transition造成的bug
    var li = element.parentNode,
        liHeight = li.offsetHeight;
    liHeight = collapse ? (liHeight - getListHeight(element)) : (liHeight + getListHeight(element));
    li.setAttribute('data-height', liHeight + ''); // 记录当前包含element的li元素应有的高度，以便element的父ul计算自己的高度

    var parentList = element.parentNode.parentNode;
    while (parentList.classList.contains('chapter-list') && !parentList.classList.contains('root-list')) {
        parentList.style.height = getListHeight(parentList) + 'px';
        parentList = parentList.parentNode.parentNode;
    }
}

// 检查目录列表，根据其是否折叠来添加折叠样式
function setCollapseStyle() {
    var doc = document.getElementsByClassName('toc')[0],
        uls = document.getElementsByClassName('chapter-list'),
        itemMark,
        i;

    for (i = 0; i < uls.length; i++) {
        if (uls[i].className.indexOf('root-list') !== -1)
            continue;
        itemMark = uls[i].parentNode.firstElementChild.firstElementChild;
        if (uls[i].classList.contains('collapse')) {
            itemMark.classList.remove('expand');
            itemMark.classList.add('collapse');
        } else {
            itemMark.classList.remove('collapse');
            itemMark.classList.add('expand');
        }
    }
}

// toc-button 的事件处理程序
document.getElementsByClassName('toc-button')[0]
    .addEventListener('click', function (e) {
        tocSide.visible = !document.getElementsByTagName('main')[0].classList.contains('toc-on');
        QiuSettings.setSideToc(tocSide.isVisible);
    });

// 翻页快捷键的事件处理程序
EPUBJS.Hooks.register("beforeChapterDisplay").pageTurns = function (callback, renderer) {
    var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
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
    var mouse = function (e) {
        e.preventDefault();
        if (lock) return;

        if (e.wheelDelta > 0) {
            book.prevPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }

        if (e.wheelDelta < 0) {
            book.nextPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }
    };
    var mouseFirefox = function (e) {
        e.preventDefault();
        if (lock) return;

        if (e.detail < 0) {
            book.prevPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }

        if (e.detail > 0) {
            book.nextPage();
            lock = true;
            setTimeout(function () {
                lock = false;
            }, 100);
            return false;
        }
    };
    renderer.doc.addEventListener('keydown', arrowKeys, false);
    if (isFirefox) renderer.doc.addEventListener('DOMMouseScroll', mouseFirefox, false);
    else renderer.doc.addEventListener('mousewheel', mouse, false);
    if (callback) callback();
};

// 翻页按钮
document.getElementsByClassName('main')[0]
    .addEventListener('click', function (e) {

        var target = e.target,
            spineLen = book.spine.length,
            currentChapterPos = book.renderer.currentChapter.spinePos;

        if (target.classList && target.classList.contains('prev-page')) {
            if (QiuSettings.pageMode) {
                book.prevPage();
            } else {
                if ((currentChapterPos - 1) < 0) {
                    alert('没有上一章了~');
                    return;
                } else {
                    book.displayChapter(currentChapterPos - 1);
                }
            }
        }

        if (target.classList && target.classList.contains('next-page')) {
            if (QiuSettings.pageMode) {
                book.nextPage();
            } else {
                if ((currentChapterPos + 1) >= spineLen) {
                    alert('没有下一章了~');
                } else {
                    book.displayChapter(currentChapterPos + 1);
                }
            }
        }
    });

/* tool-bar 的事件处理程序 */

// 鼠标移入 tool-bar 则显示
document.getElementById('tool-bar')
    .addEventListener('mouseover', function (e) {
            var bar = document.getElementById('tool-bar'),
                left = parseFloat(document.defaultView.getComputedStyle(bar, null).left),
                maxLeft = window.innerWidth - parseFloat(document.defaultView.getComputedStyle(bar, null).width);

            //console.log(e.target.nodeName.toLocaleLowerCase() + "触发了mouseover");

            if (bar.getAttribute('data-hide') === 'true') {
                bar.style.opacity = '1';
                bar.style.transform = '';
                bar.setAttribute('data-hide', 'false');
            }
        }
    );

// 鼠标移出 tool-bar 则隐藏
document.getElementById('tool-bar')
    .addEventListener('mouseout', function (e) {
        var bar = document.getElementById('tool-bar'),
            left = parseFloat(document.defaultView.getComputedStyle(bar, null).left),
            maxLeft = window.innerWidth - parseFloat(document.defaultView.getComputedStyle(bar, null).width);

        //console.log(e.target.nodeName.toLocaleLowerCase() + "触发了mouseout");

        // 只处理 .tool-bar 触发的 mouseout 事件
        if (bar.getAttribute('data-hide') !== 'true') {
            if (left >= maxLeft) {
                setTimeout(function () {
                    if (bar.getAttribute('data-hide') === 'true') {
                        left = parseFloat(document.defaultView.getComputedStyle(bar, null).left);
                        if (left >= maxLeft) // 解决拖太快的bug（鼠标移出两秒后，若元素仍然在需要用transform隐藏的范围内，则使用transform隐藏）
                            bar.style.transform = 'translateX(250px)'; // todo 自动计算宽度
                        bar.style.opacity = '.2';
                    }
                }, 2000); // 鼠标移出两秒后，若tool-bar的data-hide属性仍然为true，则隐藏
            } else {
                setTimeout(function () {
                    if (bar.getAttribute('data-hide') === 'true')
                        bar.style.opacity = '.2';
                }, 2000);
            }
            bar.setAttribute('data-hide', 'true');
        }
    });

// tool-bar 退出按钮的事件处理程序
document.getElementById('exit')
    .addEventListener('click', function (e) {
        window.location = 'index.html';
    });

// tool-bar 书签按钮的事件处理程序
document.getElementById('book-mark')
    .addEventListener('click', function (e) {
        bookMark.addBookMark(); // 添加书签
        refreshMarkPanel();
    });

// tool-bar 书签按钮的事件处理程序——展开书签列表
document.getElementById('book-mark-list')
    .addEventListener('click', function (e) {

        var panel = document.getElementById('book-mark-panel');
        panel.classList.remove('hide');

        e.preventDefault();
        e.stopPropagation();
    });

// tool-bar 调色板（模态框）的事件处理程序
document.getElementById('color-panel')
    .addEventListener('click', function (e) {
        var target = e.target,
            parent,
            element,
            lis,
            colors,
            color;

        if (target.classList.contains('color-item')) {
            lis = $('.color-item');
            lis.forEach(function (value) {
                value.classList.remove('selected');
            });
            target.classList.add('selected');
        }

        if (target.classList.contains('color-save')) {
            element = $$('.color-item.selected');
            if (!element) return;
            parent = element.parentNode;
            color = getStyle(element, 'background-color');
            if (parent.classList.contains('background'))
                setColor(color, 'background');
            if (parent.classList.contains('font'))
                setColor(color, 'font');
            if (parent.classList.contains('highlight')) {
                colors = nodeListToArray($('.highlight .color-item'));
                colors.forEach(function (color, i, arr) {
                    arr[i] = getStyle(color, 'background-color');
                });
                setColor(colors.join('$'), 'highlight');
            }
            setStyle();
        }
    });

function onColorChange(color) {
    var colorBox = $('.color-item.custom-color-item.selected')[0];
    if (colorBox) colorBox.style.backgroundColor = color;
}

function setColor(color, type) {
    if (type === 'background') {
        $$('body').style.backgroundColor = color;
        $$('.color-list.background .color-item.custom-color-item').style.backgroundColor = color;
        localStorage.setItem('bg-color', color);
    }
    if (type === 'font') {
        $$('.color-list.font .color-item.custom-color-item').style.backgroundColor = color;
        localStorage.setItem('font-color', color);
    }
    if (type === 'highlight') {
        var colors = color.split('$');
        var highlights = nodeListToArray($('.select-menu .ann-color'));
        var hlColorItems = nodeListToArray($('.highlight .color-item'));
        highlights.forEach(function (hl, i) {
            hl.style.backgroundColor = colors[i];
            hlColorItems[i].style.backgroundColor = colors[i];
        });
        localStorage.setItem('hl-color', color);
    }
}

// tool-bar 设置按钮的事件处理程序
document.getElementById('setting')
    .addEventListener('click', function (e) {
        // todo 后期用于添加setting的可配置内容
    });

// 进入全屏模式
function launchFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// 退出全屏模式
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

// tool-bar 全屏按钮的事件处理程序
document.getElementById('full-screen')
    .addEventListener('click', function (e) {
        var de = document.documentElement;
        var fullScreen = this.getAttribute('data-full-screen');
        var fullIcon = this.firstElementChild;
        var exitIcon = fullIcon.nextElementSibling;

        fullIcon.classList.remove('hidden');
        exitIcon.classList.remove('hidden');

        if (fullScreen === 'true') {
            exitFullscreen();
            this.setAttribute('data-full-screen', 'false');
            exitIcon.classList.add('hidden');
        }
        if (fullScreen === 'false') {
            launchFullscreen(de);
            this.setAttribute('data-full-screen', 'true');
            fullIcon.classList.add('hidden');
        }

        // todo 恢复进度
    });

/* 书签面板的事件处理程序 */

// 更新书签面板内容
function refreshMarkPanel() {
    var ul = document.getElementsByClassName('book-mark-content')[0];
    var marList = bookMark.getBookMarks();
    var itemStr = '<li class="book-mark-item clear" data-id="{id}" data-cfi="{cfi}" data-pos-y="{posY}"><div class="book-mark-cfi left"><a href="#!">{name}</a></div><div class="book-mark-control right"><i class="material-icons book-mark-panel-delete" title="delete">delete</i><i class="material-icons book-mark-panel-edit" title="edit">assignment</i></div></li>';
    var resultStr = '';

    marList.forEach(function (e) {
        resultStr += itemStr.replace('{cfi}', e.cfi)
            .replace('{name}', e.name)
            .replace('{posY}', e.posY)
            .replace('{id}', e.id);
    });

    ul.innerHTML = resultStr;
}

// 书签面板的事件处理程序
document.getElementById('book-mark-panel')
    .addEventListener('click', function (e) {
        var panel = document.getElementById('book-mark-panel'),
            modal = document.getElementById('book-mark-modal'),
            target = e.target,
            ul = document.getElementsByClassName('book-mark-content')[0],
            li,
            prevCfi,
            id,
            cfi,
            posY;

        // 关闭面板
        if (target.className && target.className.indexOf('book-mark-panel-close') !== -1)
            panel.classList.add('hide');

        // 删除书签
        if (target.className && target.className.indexOf('book-mark-panel-delete') !== -1) {
            li = target.parentNode.parentNode;
            id = parseInt(li.getAttribute('data-id'));
            bookMark.removeBookMark(id);
            ul.removeChild(li);
        }

        // 编辑书签内容
        if (target.className && target.className.indexOf('book-mark-panel-edit') !== -1) {
            li = target.parentNode.parentNode;
            cfi = li.getAttribute('data-cfi');
            id = li.getAttribute('data-id');
            modal.setAttribute('data-cfi', cfi);
            modal.setAttribute('data-id', id);
            document.getElementById('book-mark-name').value = '';
            QiuModal.open('book-mark-modal'); // 打开编辑模态框
        }

        // 跳转
        if (target.nodeName.toLocaleLowerCase() === 'a') {
            bookMarkFlag = false;
            cfi = target.parentNode.parentNode.getAttribute('data-cfi');
            prevCfi = book.renderer.currentChapterCfiBase;

            book.gotoCfi(cfi).then(function () {

                // 当跳转前与跳转后是相同页面时由于不能触发修改bookMarkFlag的值，因此需要单独处理
                if (cfi.indexOf(prevCfi) !== -1 && !QiuSettings.pageMode) { // 为真则说明目标页面与当前页面相同
                    posY = target.parentNode.parentNode.getAttribute('data-pos-y');
                    setYScroll(posY);
                    return;
                }

                // 在页面切换后定位 todo 更好的处理方式,观察者模式？
                if (!QiuSettings.pageMode) {
                    setTimeout(function () {
                        if (bookMarkFlag) {
                            posY = target.parentNode.parentNode.getAttribute('data-pos-y');
                            setYScroll(posY);
                            bookMarkFlag = false;
                        } else {
                            setTimeout(arguments.callee, 10);
                        }

                    }, 10);
                }
            });
        }

        e.preventDefault();
    });

// 书签模态框save按钮的事件处理程序
document.getElementById('book-mark-modal')
    .addEventListener('click', function (e) {
        var modal = this,
            target = e.target,
            lis = document.getElementsByClassName('book-mark-item'),
            id,
            markName,
            i;

        if (target.className && target.className.indexOf('book-mark-save') !== -1) {
            id = modal.getAttribute('data-id');
            markName = document.getElementById('book-mark-name').value;
            bookMark.modifyBookMark(parseInt(id), markName);

            for (i = 0; i < lis.length; i++) {
                if (lis[i].getAttribute('data-id') === id) {
                    lis[i].getElementsByClassName('book-mark-cfi')[0].firstElementChild.textContent = markName;
                    break;
                }
            }
        }
    });

/* 设置面板相关部分 */

// 设置为水平翻页——单页模式
document.getElementById('horizontal')
    .addEventListener('click', function (ev) {
        setHorizontalMode(true);
        window.location.reload();
    });

// 设置为水平翻页——双页模式
document.getElementById('double-page')
    .addEventListener('click', function (ev) {
        setHorizontalMode(false);
        window.location.reload();
    });

// 设置为垂直滚动翻页
document.getElementById('vertical')
    .addEventListener('click', setVerticalMode);

// 由垂直滚动切换到水平翻页
function setHorizontalMode(single) {
    var pageHorizontal = document.getElementsByClassName('page')[0],
        pageVertical = document.getElementsByClassName('page')[1],
        iframe = document.getElementsByTagName('iframe')[0];

    pageVertical.classList.add('hide');
    pageHorizontal.classList.remove('hide');

    QiuSettings.setPageMode(true);
    QiuSettings.setForceSingle(single);
    book.renderer.forceSingle(single);
    setStyle();
    setMargins();

    QiuPen.create(iframe.contentWindow.document);
    QiuPen.load(book);
}

// 由水平翻页切换到垂直滚动
function setVerticalMode() {
    var pageSingle = document.getElementsByClassName('page')[0],
        pageFull = document.getElementsByClassName('page')[1],
        iframe = document.getElementById('full-page-iframe'),
        link,
        script,
        indexNum = window.location.href.lastIndexOf('/'),
        pageUri = window.location.href.substring(0, indexNum);

    pageSingle.classList.add('hide');
    pageFull.classList.add('hide');
    iframe.contentDocument.head.innerHTML = book.renderer.render.getDocumentElement().getElementsByTagName('head')[0].innerHTML;
    iframe.contentDocument.body.innerHTML = book.renderer.render.getDocumentElement().getElementsByTagName('body')[0].innerHTML;
    var style = book.renderer.render.getDocumentElement().getElementsByTagName('body')[0].style.cssText;
    iframe.contentDocument.body.setAttribute('style', style);
    link = createLink(pageUri + '/css/epub/single-page.css');
    iframe.contentDocument.head.appendChild(link);
    link = createLink(pageUri + '/css/epub/common.css');
    iframe.contentDocument.head.appendChild(link);
    pageFull.classList.remove('hide');

    QiuSettings.setPageMode(false);
    setStyle();
    setMargins();

    setYScroll(0);

    // 为页面添加动态脚本
    script = createScript(pageUri + '/js/epub/locate.js');
    iframe.contentDocument.body.appendChild(script);
    script = createScript(pageUri + '/js/epub/selection.js');
    iframe.contentDocument.body.appendChild(script);

    // 监听进度变化，记录进度信息
    iframe.contentWindow.onscroll = function () {
        currentLocation.recordCurrentLocation();
    };

    QiuPen.create(iframe.contentWindow.document);
    QiuPen.load(book);
}

// 调整 font-size
document.getElementsByClassName('font-size-control')[0]
    .addEventListener('click', function (e) {
        var target = e.target,
            size = QiuSettings.fontSize ? parseInt(QiuSettings.fontSize) : 16,
            reduceIcon = document.getElementsByClassName('font-size-reduce')[0].firstElementChild,
            addIcon = document.getElementsByClassName('font-size-add')[0].firstElementChild;

        // 避免点击在icon上不能改变大小
        if ((target.classList && target.classList.contains('font-size-reduce')) || target === reduceIcon) {
            size -= 1;
            size += 'px';
            QiuSettings.setFontSize(size);
            setStyle();
        }
        if ((target.classList && target.classList.contains('font-size-add')) || target === addIcon) {
            size += 1;
            size += 'px';
            QiuSettings.setFontSize(size);
            setStyle();
        }
    });

// 调整 line-height
document.getElementsByClassName('line-height-box')[0]
    .addEventListener('click', function (e) {
        var target = e.target,
            value = QiuSettings.lineHeight ? parseFloat(QiuSettings.lineHeight) : 1.2,
            reduceIcon = document.getElementsByClassName('line-height-reduce')[0].firstElementChild,
            addIcon = document.getElementsByClassName('line-height-add')[0].firstElementChild;

        if ((target.classList && target.classList.contains('line-height-reduce')) || target === reduceIcon) {
            value -= 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'em';
            QiuSettings.setLineHeight(value);
            setStyle();
        }
        if ((target.classList && target.classList.contains('line-height-add')) || target === addIcon) {
            value += 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'em';
            QiuSettings.setLineHeight(value);
            setStyle();
        }
    });

// 调整 letter-spacing
document.getElementsByClassName('letter-spacing-box')[0]
    .addEventListener('click', function (e) {
        var target = e.target,
            value = QiuSettings.letterSpacing ? parseFloat(QiuSettings.letterSpacing) : 0.0,
            reduceIcon = document.getElementsByClassName('letter-spacing-reduce')[0].firstElementChild,
            addIcon = document.getElementsByClassName('letter-spacing-add')[0].firstElementChild;

        if ((target.classList && target.classList.contains('letter-spacing-reduce')) || target === reduceIcon) {
            value -= 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'px';
            QiuSettings.setLetterSpacing(value);
            setStyle();
        }
        if ((target.classList && target.classList.contains('letter-spacing-add')) || target === addIcon) {
            value += 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'px';
            QiuSettings.setLetterSpacing(value);
            setStyle();
        }
    });

// 调整 word-spacing
document.getElementsByClassName('word-spacing-box')[0]
    .addEventListener('click', function (e) {
        var target = e.target,
            value = QiuSettings.wordSpacing ? parseFloat(QiuSettings.wordSpacing) : 0.0,
            reduceIcon = document.getElementsByClassName('word-spacing-reduce')[0].firstElementChild,
            addIcon = document.getElementsByClassName('word-spacing-add')[0].firstElementChild;

        if ((target.classList && target.classList.contains('word-spacing-reduce')) || target === reduceIcon) {
            value -= 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'px';
            QiuSettings.setWordSpacing(value);
            setStyle();
        }
        if ((target.classList && target.classList.contains('word-spacing-add')) || target === addIcon) {
            value += 0.1;
            value = parseFloat(value.toFixed(1));
            value += 'px';
            QiuSettings.setWordSpacing(value);
            setStyle();
        }
    });

// 重置样式
document.getElementById('restore-style')
    .addEventListener('click', function () {
        QiuSettings.resetStyle();
        localStorage.setItem('stylesheet', '');
        setStyle();
        setMargins();
    });

// 对是否显示 popup 的设置
document.getElementById('toggle-popup')
    .addEventListener('click', function () {
        QiuSettings.setPopup(!QiuSettings.popup);
        var button = document.getElementById('toggle-popup');
        button.textContent = QiuSettings.popup ? 'enabled' : 'disabled';
    });

// 调整页面左右边距
function modifyLRMargins(increase) {
    var pages = document.getElementsByClassName('page');
    if (QiuSettings.pageMode) {
        var left = parseInt(getStyle(pages[0], 'left'));
        if (!increase) left = left > 80 ? left - 10 : left;
        else left += 10;
        pages[0].style.right = pages[0].style.left = left + 'px';
        QiuSettings.setHLRMargin(left + 'px');
    } else {
        var html = pages[1].getElementsByTagName('iframe')[0]
            .contentDocument
            .getElementsByTagName('html')[0];
        var width = parseInt(getStyle(html, 'width'));
        if (!increase) width = width < screen.availWidth ? width + 10 : width;
        else width = width > 500 ? width - 10 : width;
        html.style.width = width + 'px';
        QiuSettings.setVWidth(width + 'px');
    }
}

document.getElementById('reduce-lr-margin')
    .addEventListener('click', function (ev) {
        modifyLRMargins(false);
    });

document.getElementById('add-lr-margin')
    .addEventListener('click', function (ev) {
        modifyLRMargins(true);
    });

// 调整页面上下边距
function modifyTBMargins(increase) {
    if (QiuSettings.pageMode) {
        var page = document.getElementsByClassName('page')[0];
        var top = parseInt(getStyle(page, 'top'));
        if (!increase) top = top >= 10 ? top - 10 : top;
        else top += 10;
        page.style.top = page.style.bottom = top + 'px';
        QiuSettings.setHTBMargin(top + 'px');
    } else {
        alert('Not allowed to adjust the top and bottom margins in scroll mode.')
    }
}

document.getElementById('reduce-tb-margin')
    .addEventListener('click', function (ev) {
        modifyTBMargins(false);
    });

document.getElementById('add-tb-margin')
    .addEventListener('click', function (ev) {
        modifyTBMargins(true);
    });

// 读取设置的边距配置信息来调整文档边距
function setMargins() {
    var pages = document.getElementsByClassName('page');
    if (QiuSettings.pageMode) {
        var page = pages[0];
        page.style.left = page.style.right = QiuSettings.hLRMargin;
        page.style.top = page.style.bottom = QiuSettings.hTBMargin;
    } else {
        var html = pages[1].getElementsByTagName('iframe')[0]
            .contentDocument
            .getElementsByTagName('html')[0];
        html.style.width = QiuSettings.vWidth;
    }
}

// 从 setting 读取样式并设置
function setStyle() {
    var fontSize = document.getElementsByClassName('font-size')[0];
    var lineHeight = document.getElementsByClassName('line-height')[0];
    var letterSpacing = document.getElementsByClassName('letter-spacing')[0];
    var wordSpacing = document.getElementsByClassName('word-spacing')[0];
    var userStyleText = localStorage.getItem('stylesheet');
    var iframe, style, userStyle;

    if (QiuSettings.pageMode) {
        iframe = document.getElementsByClassName('page')[0].firstElementChild.firstElementChild;
    } else {
        iframe = document.getElementsByClassName('page')[1].firstElementChild;
    }
    if (iframe.contentDocument.getElementById('style-setting')) {
        style = iframe.contentDocument.getElementById('style-setting');
    } else {
        style = iframe.contentDocument.createElement('style');
        style.id = 'style-setting';
        iframe.contentDocument.head.appendChild(style);
    }
    if (iframe.contentDocument.getElementById('user-style')) {
        userStyle = iframe.contentDocument.getElementById('user-style');
    } else {
        userStyle = iframe.contentDocument.createElement('style');
        userStyle.id = 'user-style';
        iframe.contentDocument.head.appendChild(userStyle);
    }
    userStyle.innerHTML = userStyleText;

    var cssText = [
        'h1, h2, h3, h4, h5, h6, a, article, cite, code, div, li, p, pre, span, table {',
        '    font-size: {value} !important;',
        '    line-height: {value} !important;',
        '    letter-spacing: {value} !important;',
        '    word-spacing: {value} !important;',
        '    color: {value} !important;',
        '}',
        'img {',
        '    max-width: 100% !important;',
        '}'
    ];

    cssText[1] = QiuSettings.fontSize ? cssText[1].replace('{value}', QiuSettings.fontSize) : '';
    cssText[2] = QiuSettings.lineHeight ? cssText[2].replace('{value}', QiuSettings.lineHeight) : '';
    cssText[3] = QiuSettings.letterSpacing ? cssText[3].replace('{value}', QiuSettings.letterSpacing) : '';
    cssText[4] = QiuSettings.wordSpacing ? cssText[4].replace('{value}', QiuSettings.wordSpacing) : '';
    cssText[5] = localStorage.getItem('font-color') ? cssText[5].replace('{value}', localStorage.getItem('font-color')) : '';

    // 从设置面板来更换高亮颜色
    var colors, classes, rule, stylesheet = '';
    colors = localStorage.getItem('hl-color');
    if (colors) {
        colors = colors && colors.split('$');
        classes = ['.hl-red', '.hl-yellow', '.hl-green', '.hl-blue', '.hl-orange'];
        colors.forEach(function (color, i) {
            rule = classes[i] + ' {\n\tbackground-color: ' + color + " !important;\n}\n";
            stylesheet += rule;
        });
        cssText[10] = stylesheet;
    }

    style.innerHTML = cssText.join('\n');
    fontSize.textContent = QiuSettings.fontSize ? QiuSettings.fontSize : 'default';
    lineHeight.textContent = QiuSettings.lineHeight ? QiuSettings.lineHeight : 'default';
    letterSpacing.textContent = QiuSettings.letterSpacing ? QiuSettings.letterSpacing : 'default';
    wordSpacing.textContent = QiuSettings.wordSpacing ? QiuSettings.wordSpacing : 'default';
}

// 用户自定义样式表
document.getElementById('import-stylesheet')
    .addEventListener('change', function (e) {
        var files = e.target.files;
        var reader = new FileReader();
        var type = 'text';

        if (files[0].type.indexOf(type) === -1) {
            alert('Invalid file');
            return;
        }
        reader.readAsText(files[0]);
        files.length = 0;

        reader.onerror = function () {
            alert('There is a error. Please try again. Error code: ' + reader.error.code + '.');
        };

        reader.onload = function () {
            alert('The stylesheet has been imported.');
            localStorage.setItem('stylesheet', reader.result);
            setStyle();
        };
    });

// 锚点定位
function pageYScrollTo(targetId) {
    var iframe = document.getElementById('full-page-iframe');
    var target = iframe.contentDocument.getElementById(targetId);
    iframe.contentWindow.document.getElementsByTagName('body')[0].scrollTop = getElementTop(target);
}

// 获取元素在页面的纵坐标
function getElementTop(element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

// 设置垂直滚动模式下滚动条距顶部的距离
function setYScroll(posY) {
    var iframe = document.getElementById('full-page-iframe');
    iframe.contentWindow.document.getElementsByTagName('body')[0].scrollTop = posY;
}

// 获取垂直滚动模式下滚动条距顶部的距离
function getYScroll() {
    if (QiuSettings.pageMode) {
        return 0;
    }
    var iframe = document.getElementById('full-page-iframe');
    return iframe.contentWindow.document.getElementsByTagName('body')[0].scrollTop;
}

// 创建动态脚本
function createScript(url) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    return script;
}

// 创建动态样式表
function createLink(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;

    return link;
}

// 为 select menu 绑定事件
document.getElementById('select-menu')
    .addEventListener('click', function (e) {
        var menu = this,
            target = e.target,
            classArr,
            iframe,
            result;

        if (QiuSettings.pageMode) iframe = document.getElementsByTagName('iframe')[0];
        else iframe = document.getElementsByTagName('iframe')[1];

        if (target.className.indexOf('ann-color') !== -1) {
            classArr = target.className.split(' ');
            classArr.forEach(function (item) {
                if (item.indexOf('hl-') !== -1) {
                    QiuPen.highlighter.highlightSelection(item);
                    QiuPen.save(book);
                }
            });
        }
        if (target.className.indexOf('delete-hl') !== -1) {
            QiuPen.highlighter.unhighlightSelection();
            QiuPen.save(book);
        }
        if (target.className.indexOf('copy-text') !== -1) {
            result = iframe.contentWindow.document.execCommand('copy', false, null);
            !result ? console.log('failed to copy text to clipboard') : '';
        }
        if (target.className.indexOf('translate-text') !== -1) {
            result = iframe.contentDocument.getSelection().toString();
            // TODO
        }

        menu.style.visibility = 'hidden';
    });

// 解决复制粘贴问题的 hack
document.addEventListener('keydown', function (e) {
    var key = e.keyCode || e.which;
    if (key === 67 && e.ctrlKey) {
        document.execCommand('copy', false, null);
    }
});

// 解决复制粘贴问题的 hack
document.addEventListener('copy', function (e) {
    var iframe;
    if (QiuSettings.pageMode) iframe = document.getElementsByTagName('iframe')[0];
    else iframe = document.getElementsByTagName('iframe')[1];

    copyText = iframe.contentDocument.getSelection().toString() || document.getSelection().toString();
    e.clipboardData.setData('text/plain', copyText);
    e.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
});

window.onload = function () {
    QiuSettings.init();

    init();

    new QiuDrag('tool-bar');

    new QiuColorPicker('color-picker', onColorChange);

    // 触发 tool-bar 隐藏效果
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('mouseout', true, true);
    document.getElementById('tool-bar').dispatchEvent(evt);

    // 初始化模态框
    QiuModal.init();

    new QiuTab('setting-tab');

    refreshMarkPanel();  // 初始化书签面板

    QiuPen.init();
};
