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
        }
        else {
            QiuSettings.pageMode = true;
            QiuSettings.fontSize = '';
            QiuSettings.sideToc = true;
            QiuSettings.lineHeight = '';
            QiuSettings.letterSpacing = '';
            QiuSettings.wordSpacing = '';
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

    QiuSettings.resetStyle = function () {
        QiuSettings.fontSize = '';
        QiuSettings.lineHeight = '';
        QiuSettings.letterSpacing = '';
        QiuSettings.wordSpacing = '';
        localStorage.setItem('settings', JSON.stringify(QiuSettings));
    };
    
    win.QiuSettings = QiuSettings;
    
}(window));