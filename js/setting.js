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
        }
        else {
            QiuSettings.pageMode = true;
            QiuSettings.fontSize = '100%';
            QiuSettings.sideToc = true;
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
    
    win.QiuSettings = QiuSettings;
    
}(window));