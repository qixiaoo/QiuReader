(function (win) {

    'use strict';

    // QiuTab 的构造函数
    function QiuTab(element) {
        this.element = typeof element === 'object' ? element : document.getElementById(element);
        this.tabs = _getTabs(this.element);
        this.panels = _getTargetPanels(this.element);
        this.slider = _addSlider(this.tabs);
        this.init();
    }
    
    // 原型方法
    QiuTab.prototype = {
        constructor: QiuTab,
        
        init: function () {
            _initPanel(this.tabs, this.panels); // 初始化tab-panel
            _bindEvent(this); // 绑定事件
        },

        // 选中特定tab
        select: function (tab_panel_id) {
            var targetTab,
                children = this.tabs.childNodes,
                targetPanel = document.getElementById(tab_panel_id),
                panels = this.panels,
                i;

            for (i = 0; i < children.length; i++) {
                if (children[i].nodeType === 1 && children[i].classList.contains('tab')) {
                    if (children[i].firstElementChild && children[i].firstElementChild.href && children[i].firstElementChild.href.split('#')[1] === tab_panel_id) {
                        targetTab = children[i];
                        targetTab.classList.add('active');
                    } else {
                        children[i].classList.remove('active');
                    }
                }
            }

            for (i = 0; i < panels.length; i++) {
                if (panels[i].id !== tab_panel_id)
                    panels[i].style.display = 'none';
            }

            if (targetPanel && targetPanel.style)
                targetPanel.style.display = 'block';

            // slider滑动到相应位置
            _setSliderPosition(this.tabs, this.slider);
        }
    };

    function _getTabs(element) {
        var children = element.childNodes,
            tabs,
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i].nodeType === 1 && children[i].classList.contains('tabs'))
                return children[i];
        }
    }

    function _getTargetPanels(element) {
        var children = element.childNodes,
            panels = [],
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i].nodeType === 1 && children[i].classList.contains('tab-panel'))
                panels.push(children[i]);
        }

        return panels;
    }

    function _addSlider(tabs) {
        var slider = document.createElement('div');
        slider.className = 'tab-slider';
        tabs.appendChild(slider);
        _setSliderPosition(tabs, slider);

        return slider;
    }

    function _setSliderPosition(tabs, slider) {
        var children = tabs.childNodes,
            left = 0,
            right = 0,
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i].nodeType === 1 && children[i].classList.contains('tab'))
                right += parseFloat(_getWidth(children[i]));
            if (children[i].nodeType === 1 && children[i].classList.contains('active')) {
                left = right - parseFloat(_getWidth(children[i]));
                break;
            }
        }

        slider.style.left = left + 'px';
        slider.style.right = parseFloat(_getWidth(tabs)) - right + 'px';
    }

    function _getWidth(element) {
        return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null).width : element.currentStyle.width;
    }

    function _initPanel(tabs, panels) {
        var children = tabs.childNodes,
            activeTab,
            panelId,
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i].classList && children[i].classList.contains('tab') && children[i].classList.contains('active'))
                activeTab = children[i];
        }

        if (activeTab.firstElementChild && activeTab.firstElementChild.href)
            panelId = activeTab.firstElementChild.href.split('#')[1];

        for (i = 0; i < panels.length; i++) {
            if (panels[i].id === panelId)
                panels[i].style.display = 'block';
            else
                panels[i].style.display = 'none';
        }
    }

    // 为tab绑定事件（事件委托）
    function _bindEvent(element) {
        element.tabs.addEventListener('click', function (e) {
            var target = e.target,
                targetId;

            if (target.href) {
                targetId = target.href.split('#')[1];
                element.select(targetId);
                e.preventDefault();
            }
        });
    }
    
    win.QiuTab = QiuTab;

}(window));