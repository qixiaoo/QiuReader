/**
 * 封装js拖拽对象
 *
 * 实现参考 https://codepen.io/yangbo5207/pen/LWjWpe
 * 对应教程 http://www.jianshu.com/p/b3dee0e84454
 *
 * 相较于教程，去掉不够灵活的transform，只使用绝对定位改变位置
 */
(function (win) {

    'use strict';

    // QiuDrag 的构造函数
    function QiuDrag(element) {
        this.element = typeof element === 'object' ? element : document.getElementById(element);

        // 鼠标初始位置
        this.startX = 0;
        this.startY = 0;
        // 目标元素初始位置
        this.sourceX = 0;
        this.sourceY = 0;

        this.init(); // 初始化
    }

    // 重写QiuDrag的原型，设置对象实例共享的方法
    QiuDrag.prototype = {
        constructor: QiuDrag, // 避免重写原型后丢失 constructor 属性

        init: function () {
            this.bindEvent.call(this); // 绑定事件处理程序
        },

        getStyle: function (property) {
            return getStyle(this.element, property);
        },

        getPosition: function () {
            var pos = {x: 0, y: 0};

            if (this.getStyle('position') === 'static') {
                this.element.style.position = 'relative';
            } else {
                pos = {
                    x: parseInt(this.getStyle('left') ? this.getStyle('left') : 0),
                    y: parseInt(this.getStyle('top') ? this.getStyle('top') : 0)
                }
            }

            return pos;
        },

        setPosition: function (pos) {
            this.element.style.left = pos.x + 'px';
            this.element.style.top = pos.y + 'px';
        },

        // 绑定事件处理程序
        bindEvent: function () {
            var self = this;
            self.element.addEventListener('mousedown', start, false);
            
            function start(event) {
                // 获取鼠标初始位置
                self.startX = event.pageX;
                self.startY = event.pageY;

                var pos = self.getPosition();

                // 获取目标元素初始位置
                self.sourceX = pos.x;
                self.sourceY = pos.y;

                document.addEventListener('mousemove', move, false);
                document.addEventListener('mouseup', end, false);
            }
            
            function move(event) {
                // 获取鼠标当前位置
                var currentX = event.pageX;
                var currentY = event.pageY;

                // 鼠标移动距离
                var distanceX = currentX - self.startX;
                var distanceY = currentY - self.startY;

                var destX = (self.sourceX + distanceX).toFixed();
                var destY = (self.sourceY + distanceY).toFixed();

                // 元素可以设置的最大left和最大top（避免移出屏幕）
                var maxEX = win.innerWidth - parseFloat(self.getStyle('width'));
                var maxEY = win.innerHeight - parseFloat(self.getStyle('height'));

                destX = destX > maxEX ? maxEX : destX;
                destX = destX < 0 ? 0 : destX;
                destY = destY > maxEY ? maxEY : destY;
                destY = destY < 0 ? 0 : destY;

                // 计算并设置
                self.setPosition({
                    x: destX,
                    y: destY
                })
            }
            
            function end(event) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', end);
            }
        }
    };

    // 获取计算样式的兼容的写法
    function getStyle(e, property) {
        return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(e, null)[property] : e.currentStyle[property];
    }

    win.QiuDrag = QiuDrag;

}(window));