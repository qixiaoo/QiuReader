// 记录书籍的阅读进度信息
var currentLocation = {

    // todo vertical 模式记录位置
    recordCurrentCfi: function () {
        var bookKey = localStorage.getItem('reading');
        var current = book.getCurrentLocationCfi();
        localStorage.setItem('currentLocationCfi'+bookKey, current);
    },

    getCurrentCfi: function () {
        var bookKey = localStorage.getItem('reading');

        for(var i = 0; i < localStorage.length; i++){
            if (localStorage.key(i) === ('currentLocationCfi'+bookKey)) {
                return localStorage.getItem(localStorage.key(i));
            }
        }

        return '';
    },

    // 清除特定书籍的进度信息
    clear: function (bookKey) {
        var i;

        for (i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) === ('currentLocationCfi'+bookKey)) {
                localStorage.removeItem(localStorage.key(i));
                break;
            }
        }
    }
};