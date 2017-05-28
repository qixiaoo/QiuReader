
(function (win) {

    'use strict';

    var QiuModal = win.QiuModal = {};

    var property = {
        opacity: '.5',
        duration: '.5s',
        dismissible: false
    };

    /**
     * 打开或关闭模态框的背景层
     */
    var toggleOverlay = function (open) {
        var overlay = document.getElementsByClassName('modal-overlay')[0];

        overlay.style.transitionDuration = property.duration;

        if (open) {
            overlay.style.visibility = 'visible';
            overlay.style.opacity = property.opacity;
        } else {
            overlay.style.visibility = 'hidden';
            overlay.style.opacity = '0';
        }
    };

    /**
     * 打开模态框
     */
    var open = QiuModal.open = function (modalId) {
        var modal = document.getElementById(modalId);

        toggleOverlay(true);

        modal.style.transitionDuration = property.duration;

        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1, 1)';
    };

    /**
     * 关闭模态框
     */
    var close = QiuModal.close = function (modalId) {
        var modal = document.getElementById(modalId);

        toggleOverlay(false);

        modal.style.transitionDuration = property.duration;

        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.7, 0.7)';
    };

    /**
     * 初始化，第一次使用模态框之前调用一次
     * 为 modal-trigger 和 modal-close 绑定事件处理程序
     */
    var init = QiuModal.init = function () {
        var doc = win.document,
            trigger = doc.getElementsByClassName('modal-trigger'),
            closer = doc.getElementsByClassName('modal-close'),
            overlay,
            i;

        // 遍历绑定事件
        for (i = 0; i < trigger.length; i++) {
            trigger[i].onclick = function () {
                open(this.getAttribute('modal-target'));
                return false;
            };
        }
        for (i = 0; i < closer.length; i++) {
            closer[i].onclick = function () {
                close(this.getAttribute('modal-target'));
                return false;
            };
        }

        // 创建模态框的背景层：modal-overlay
        overlay = doc.createElement('div');
        overlay.className = 'modal-overlay';
        doc.getElementsByTagName('body')[0].appendChild(overlay);
    };

    /**
     * 据传入的 option 来设置模态框参数，参数模仿 Materialize 的模态框部分设置
     *
     * option 对象的属性
     * 1. opacity：背景的透明度（默认为0.5）
     * 2. duration：出现的时间（默认为0.5s）
     * 3. dismissible：是否可以点击模态框外部退出（默认为false）
     */
    var set = QiuModal.set = function (modalId, option) {
        var doc = win.document,
            modal,
            overlay;

        modal = doc.getElementById(modalId);
        overlay = doc.getElementsByClassName('modal-overlay')[0];

        if (option && option.opacity)
            property.opacity = option.opacity;
        if (option && option.duration)
            property.duration = option.duration;
        if (option && option.top)
            property.top = option.top;
        if (option && option.dismissible)
            overlay.onclick = function () {
                close(modalId);
            };
    };

}(window));