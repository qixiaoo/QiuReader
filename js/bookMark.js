// 记录书签信息
// 以 book-marks 为键存储在 localStorage，值得 JSON 字符串
// 序列化之前的对象以书籍的bookKey为属性，属性的值为MarkItem对象数组

(function (win) {

    'use strict';

    var marks = null,
        bookMark = {};

    function MarkItem(cfi, posY) {
        this.cfi = cfi;
        this.name = cfi;
        this.posY = posY;
    }

    // 添加书签
    var addBookMark = bookMark.addBookMark = function () {
        var key = localStorage.getItem('reading');
        var markJSON = localStorage.getItem('book-marks');
        var currentCfi = book.getCurrentLocationCfi();
        var currentPosY = getYScroll();
        var item = new MarkItem(currentCfi, currentPosY);

        if (markJSON) {
            marks = JSON.parse(markJSON);
            if (marks[key]) {
                marks[key].push(item);
            }
            else {
                marks[key] = [];
                marks[key].push(item);
            }
        } else {
            marks = {};
            marks[key] = [];
            marks[key].push(item);
        }

        localStorage.setItem('book-marks', JSON.stringify(marks));
    };

    // 获取书签列表
    var getBookMarks = bookMark.getBookMarks = function () {
        var key = localStorage.getItem('reading');
        var markJSON = localStorage.getItem('book-marks');

        marks = markJSON ? JSON.parse(markJSON) : {};
        marks[key] = marks[key] ? marks[key] : [];

        return marks[key];
    };

    // 删除某项书签
    var removeBookMark = bookMark.removeBookMark = function (mark) {
        var key = localStorage.getItem('reading');
        var markJSON = localStorage.getItem('book-marks');
        var markList;

        if (markJSON) {
            marks = JSON.parse(markJSON);
            marks = marks ? marks : {};
            if (marks[key]) {
                markList = marks[key].filter(function (elem) {
                    return (elem.cfi !== mark);
                });
                marks[key] = markList;
            } else
                marks[key] = [];
        } else {
            marks = {};
            marks[key] = [];
        }

        localStorage.setItem('book-marks', JSON.stringify(marks));
    };

    // 删除某本书的书签
    var removeBookMarks = bookMark.removeBookMarks = function (bookKey) {
        var markJSON = localStorage.getItem('book-marks');

        if (markJSON) {
            marks = JSON.parse(markJSON);
            if (marks && marks[bookKey]) {
                delete marks[bookKey]; // 删除此属性
                localStorage.setItem('book-marks', JSON.stringify(marks));
            }
        }
    };

    // 修改书签内容
    var modifyBookMark = bookMark.modifyBookMark = function (cfi, name) {
        var key = localStorage.getItem('reading');
        var markJSON = localStorage.getItem('book-marks');
        marks = JSON.parse(markJSON);

        marks[key].forEach(function (e, i, arr) {
            arr[i].name = e.cfi === cfi ? name : arr[i].name;
        });

        localStorage.setItem('book-marks', JSON.stringify(marks));
    };

    win.bookMark = bookMark;

}(window));
