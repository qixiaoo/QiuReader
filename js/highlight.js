(function (win) {

    'use strict';

    var QiuPen = {
        highlighter: null
    };

    var classes = [
        'hl-red', 'hl-orange', 'hl-yellow', 'hl-green', 'hl-blue', 'hl-purple',
        'line-red', 'line-orange', 'line-yellow', 'line-green', 'line-blue', 'line-purple'
    ];
    var classAppliers = [];

    function Highlight(chapterPos, highlight) {
        this.chapterPos = chapterPos;
        this.highlight = highlight;
    }

    QiuPen.init = function () {
        rangy.init(); // 初始化rangy模块
        classes.forEach(function (item) {
            var classApplier = rangy.createClassApplier(item, {
                ignoreWhiteSpace: true,
                elementTagName: 'span'
            });
            classAppliers.push(classApplier);
        });
    };

    QiuPen.create = function (document) {
        QiuPen.highlighter = rangy.createHighlighter(document); // 创建一个highlighter
        classAppliers.forEach(function (item) {
            QiuPen.highlighter.addClassApplier(item);
        });
    };

    QiuPen.save = function (book) {
        var store = localStorage.getItem('highlight') || '{}';
        store = JSON.parse(store);
        var bookKey = localStorage.getItem('reading');
        store[bookKey] = store[bookKey] || [];
        var chapterPos = book.renderer.currentChapter.spinePos;
        var serStr = QiuPen.highlighter.serialize();
        var hlObj = new Highlight(chapterPos, serStr);
        store[bookKey].push(hlObj);
        localStorage.setItem('highlight', JSON.stringify(store));
    };

    QiuPen.load = function (book) {
        var store = localStorage.getItem('highlight');
        if (!store) return;
        var bookKey = localStorage.getItem('reading');
        store = JSON.parse(store);
        var hlObjs = store[bookKey];
        if (!hlObjs) return;
        var chapterPos = book.renderer.currentChapter.spinePos;
        var result = null;
        hlObjs.forEach(function (item) {
            if (item.chapterPos === chapterPos) {
                result = item;
            }
        });
        if (!result) return;
        QiuPen.highlighter.deserialize(result.highlight);
    };

    QiuPen.clear = function (bookKey) {
        var store = localStorage.getItem('highlight');
        if (!store) return;
        store = JSON.parse(store);
        var hlObjs = store[bookKey];
        if (!hlObjs) return;
        delete store[bookKey];
        localStorage.setItem('highlight', JSON.stringify(store));
    };

    win.QiuPen = QiuPen;

}(window));