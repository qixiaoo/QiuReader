// 监听选中文本
document.addEventListener('mouseup', function (e) {
    var sel = window.getSelection();
    if (!sel.isCollapsed && window.parent.QiuSettings.popup) selected(e);
    else window.parent.document.getElementById('select-menu').style.visibility = 'hidden';
});

// 选中文本后的事件处理程序
function selected(e) {
    var x = e.clientX,
        y = e.clientY,
        parentWin = window.parent,
        menu = parentWin.document.getElementById('select-menu'),
        tocSide = parentWin.document.getElementsByClassName('toc-side')[0],
        tocSideWidth = parentWin.document.defaultView.getComputedStyle(tocSide, null).width,
        menuHeight = parentWin.document.defaultView.getComputedStyle(menu, null).height,
        menuWidth = parentWin.document.defaultView.getComputedStyle(menu, null).width,
        screenHeight = parentWin.screen.availHeight,
        screenWidth = parentWin.screen.availWidth;

    x = parentWin.QiuSettings.sideToc ? x + parseInt(tocSideWidth) : x;
    x = parentWin.QiuSettings.pageMode ? x + parseInt(parentWin.QiuSettings.hLRMargin) : x;
    y = parentWin.QiuSettings.pageMode ? y + parseInt(parentWin.QiuSettings.hTBMargin) : y;

    menuHeight = parseInt(menuHeight);
    menuWidth = parseInt(menuWidth);

    if ((screenWidth - x) < menuWidth) {
        menu.style.left = x - menuWidth + 'px';
    } else {
        menu.style.left = x + 'px'
    }
    if ((screenHeight - y) < menuHeight) {
        menu.style.top = y - menuHeight + 'px';
    } else {
        menu.style.top = y + 'px'
    }

    menu.style.visibility = 'visible';
}

// 解决复制粘贴问题的 hack
document.addEventListener('keydown', function (e) {
    var key = e.keyCode || e.which;
    if (key === 67 && e.ctrlKey) {
        document.execCommand('copy', false, null);
    }
});