// QiuSettings对象保存设置信息，以JSON字符串存储在localStorage（键为settings）
(function (win) {
    
    'use strict';
    
    var QiuSettings = {};
    
    QiuSettings.init = function () {
        var json = localStorage.getItem('settings'),
            o;
        
        if (json && JSON.parse(json)) {
            o = JSON.parse(json);
            QiuSettings.pageMode = o.pageMode;
            QiuSettings.fontSize = o.fontSize;
            QiuSettings.sideToc = o.sideToc;
            QiuSettings.lineHeight = o.lineHeight;
            QiuSettings.letterSpacing = o.letterSpacing;
            QiuSettings.wordSpacing = o.wordSpacing;
            QiuSettings.popup = o.popup;
            QiuSettings.hLRMargin = o.hLRMargin || '80px'; // horizontal 模式下的左右边距
            QiuSettings.hTBMargin = o.hTBMargin || '60px'; // horizontal 模式下的上下边距
            QiuSettings.vWidth = o.vWidth || '700px'; // vertical 模式下的页面宽度
            QiuSettings.forceSingle = !!o.forceSingle; // 是否启用强制单页
        }
        else {
            QiuSettings.pageMode = true;
            QiuSettings.fontSize = '';
            QiuSettings.sideToc = true;
            QiuSettings.lineHeight = '';
            QiuSettings.letterSpacing = '';
            QiuSettings.wordSpacing = '';
            QiuSettings.popup = true;
            QiuSettings.hLRMargin = '80px';
            QiuSettings.hTBMargin = '60px';
            QiuSettings.vWidth = '700px';
            QiuSettings.forceSingle = false;
            localStorage.setItem('settings', JSON.stringify(QiuSettings));
        }
    };

    QiuSettings.setFontSize = function (size) {
        QiuSettings.fontSize = size;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setPageMode = function (mode) {
        QiuSettings.pageMode = mode;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setSideToc = function (visiable) {
        QiuSettings.sideToc = visiable;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setLineHeight = function (lineHeight) {
        QiuSettings.lineHeight = lineHeight;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setLetterSpacing = function (letterSpacing) {
        QiuSettings.letterSpacing = letterSpacing;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setWordSpacing = function (wordSpacing) {
        QiuSettings.wordSpacing = wordSpacing;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setPopup = function (popup) {
        QiuSettings.popup = popup;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setHLRMargin = function (margin) {
        QiuSettings.hLRMargin = margin;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setHTBMargin = function (margin) {
        QiuSettings.hTBMargin = margin;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setVWidth = function (margin) {
        QiuSettings.vWidth = margin;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.setForceSingle = function (forceSingle) {
        QiuSettings.forceSingle = forceSingle;
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };

    QiuSettings.resetStyle = function () {
        QiuSettings.fontSize = '';
        QiuSettings.lineHeight = '';
        QiuSettings.letterSpacing = '';
        QiuSettings.wordSpacing = '';
        QiuSettings.hLRMargin = '80px';
        QiuSettings.hTBMargin = '60px';
        QiuSettings.vWidth = '700px';
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };
    
    win.QiuSettings = QiuSettings;
    
}(window));