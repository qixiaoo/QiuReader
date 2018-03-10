// 参考：http://blog.csdn.net/d9hfdl73/article/details/55210228

(function (win) {

    'use strict';

    var barWidth = 15;
    var panelWidth = 256;
    var margin = 5;
    var boxWidth = 15;
    var onChange;

    function QiuColorPicker(element, callback) {
        this.element = typeof element === 'object' ? element : document.getElementById(element);
        this.canvas = document.createElement('canvas');
        this.canvas.width = barWidth + margin + panelWidth + margin + boxWidth;
        this.canvas.height = panelWidth;
        onChange = callback;
        this.init();
    }

    QiuColorPicker.prototype = {

        constructor: QiuColorPicker,

        init: function () {
            this.element.appendChild(this.canvas);
            this.element.dataset.color = 'rgba(255,255,255,1)';

            var canvas = this.canvas;
            paintBar(canvas, 0, 0, 0, panelWidth);
            paintPanel(canvas, 'rgba(255,0,0,1)', barWidth + margin, 0);
            paintBox(canvas, 'rgba(230,111,111,1)', canvas.width - boxWidth, 0);
            canvas.addEventListener('click', clickHandler);
        }

    };

    // 默认为 15 * 256 的矩形
    function paintBar(canvas, x1, y1, x2, y2) {
        var context = canvas.getContext('2d');
        var gradient = context.createLinearGradient(x1, y1, x2, y2);

        gradient.addColorStop(0, 'rgb(255,0,0)');
        gradient.addColorStop(1 / 7, 'rgb(255,128,0)');
        gradient.addColorStop(2 / 7, 'rgb(255,255,0)');
        gradient.addColorStop(3 / 7, 'rgb(0,255,0)');
        gradient.addColorStop(4 / 7, 'rgb(0,255,255)');
        gradient.addColorStop(5 / 7, 'rgb(0,0,255)');
        gradient.addColorStop(6 / 7, 'rgb(128,0,255)');
        gradient.addColorStop(1, 'rgb(255,0,0)');

        context.fillStyle = gradient;
        context.fillRect(x1, y1, barWidth, y2 - y1);
    }

    // 默认为 256 * 256 的矩形
    function paintPanel(canvas, color, x, y) {
        var context = canvas.getContext('2d');
        var gradient = context.createLinearGradient(x, y, x + panelWidth, y);

        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, color);

        context.fillStyle = gradient;
        context.fillRect(x, y, panelWidth, panelWidth);

        gradient = context.createLinearGradient(x, y, x, y + panelWidth);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');

        context.fillStyle = gradient;
        context.fillRect(x, y, panelWidth, panelWidth);
    }

    // 已经选择的颜色
    function paintBox(canvas, color, x, y) {
        var context = canvas.getContext('2d');
        context.fillStyle = color;
        context.fillRect(x, y, boxWidth, panelWidth);
    }

    // 响应点击的事件处理程序
    function clickHandler(event) {
        var pos = {
            x: event.offsetX || event.layerX,
            y: event.offsetY || event.layerY
        };
        var canvas = event.target;
        if (pos.x >= 0 && pos.x <= barWidth && pos.y >= 0 && pos.y <= panelWidth) {
            canvas.dataset.color = getColorAtPoint(canvas, pos, 'bar');
            paintPanel(canvas, canvas.dataset.color, barWidth + margin, 0);
        } else if (pos.x >= (barWidth + margin) && pos.x <= (barWidth + margin + panelWidth) && pos.y >= 0 && pos.y <= panelWidth) {
            canvas.dataset.color = getColorAtPoint(canvas, pos, 'panel');
        } else {
            return;
        }
        console.log('color: ', canvas.dataset.color);
        paintBox(canvas, canvas.dataset.color, canvas.width - boxWidth, 0);
        typeof onChange === 'function' && onChange(canvas.dataset.color);
    }

    function getColorAtPoint(canvas, pos, area) {
        var context = canvas.getContext('2d');
        var imgData;
        if (area === 'bar') {
            imgData = context.getImageData(0, 0, barWidth, panelWidth);
        }
        if (area === 'panel') {
            imgData = context.getImageData(barWidth + margin, 0, panelWidth, panelWidth);
            pos.x = pos.x - barWidth - margin;
        }
        var data = imgData.data;
        var dataIndex = (pos.y * imgData.width + pos.x) * 4;
        return 'rgba(' +
            data[dataIndex] + ',' +
            data[dataIndex + 1] + ',' +
            data[dataIndex + 2] + ',' +
            (data[dataIndex + 3] / 255).toFixed(2) + ')';
    }

    win.QiuColorPicker = QiuColorPicker;

}(window));