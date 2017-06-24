// 记录书籍的阅读进度信息
var currentLocation = {

    // 分隔符
    separator: ' qiu-separator ',

    recordCurrentLocation: function () {
        var bookKey = localStorage.getItem('reading');
        var currentCfi = book.getCurrentLocationCfi();
        var currentY = getYScroll();
        var current = currentCfi + this.separator + currentY;
        localStorage.setItem('currentLocationCfi' + bookKey, current);
    },

    getCurrentLocation: function () {
        var bookKey = localStorage.getItem('reading');

        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) === ('currentLocationCfi' + bookKey)) {
                var value = localStorage.getItem(localStorage.key(i));
                var result = {};
                result.cfi = value.split(this.separator)[0];
                result.posY = value.split(this.separator)[1];

                return result;
            }
        }

        return false;
    },

    // 清除特定书籍的进度信息
    clear: function (bookKey) {
        var i;

        for (i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) === ('currentLocationCfi' + bookKey)) {
                localStorage.removeItem(localStorage.key(i));
                break;
            }
        }
    }
};