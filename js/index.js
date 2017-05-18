var bookStr = '<div class="book-head {background}"><div class="cover"><div class="cover-border"><div class="book-title">{book-name}</div></div></div><div class="mask-content"><div class="mak-top clear"><i class="icon-delete right" title="删除书籍"></i><i class="icon-edit right" title="编辑书籍信息"></i></div><div class="mask-bottom"><button class="open-book btn-flat">OPEN BOOK</button></div></div><div class="mask"></div></div><div class="book-body"><div class="author-box"><span>作者：</span><span>{author}</span></div></div><div class="book-control"></div>';

// 添加书籍按钮的事件处理程序
document.getElementById('add-book')
    .addEventListener('change', function (e) {

        var firstFile = e.target.files[0];

        if (window.FileReader) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(firstFile);

            reader.onload = function (e) {
                var book = ePub({
                    bookPath: e.target.result
                });

                book.getMetadata().then(function (metadata) {
                    var key = metadata.identifier,
                        name = metadata.bookTitle,
                        author = metadata.creator,
                        article = new Book(key, name, author, e.target.result);

                    console.log(metadata);
                    addBookToPage(article);
                    bookDB.open(function () {
                        bookDB.addBook(
                            article,
                            function () {
                                console.log('add book successfully!');
                            },
                            function () {
                                console.log('some error occured!');
                            }
                        );
                    });
                });
            }.bind(this);

            reader.onerror = function () {
                alert('Σ(っ °Д °;)っ Some error occured, please try again!');
            };

        } else {
            alert('Your browser does not support the required features. Please use a modern browser such as Google Chrome, or Mozilla Firefox');
        }
    });

// 编辑书籍信息的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeName.toLocaleLowerCase() === 'i' && target.className.indexOf('edit') !== -1) {
            var book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;
            // TODO 处理程序
        }
    });

// 删除书籍的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeName.toLocaleLowerCase() === 'i' && target.className.indexOf('delete') !== -1) {
            var book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;
            this.removeChild(book);
        }
    });

// 打开书籍按钮的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeName.toLocaleLowerCase() === 'i' && target.className.indexOf('open-book') !== -1) {
            var book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;
            // TODO 处理程序
        }
    });

// 打开页面时初始化书籍列表
function init() {
    'use strict';

    bookDB.open(function () {
        bookDB.getBooks(
            function (books) {
                console.log(books);
                books.forEach(function (book) {
                    addBookToPage(book)
                });
            },
            function () {
                alert('获取书籍信息失败，请尝试刷新页面');
            }
        );
    });
}

// 向页面添加一本书籍
function addBookToPage(obj) {
    'use strict';

    var list = document.getElementsByClassName('book-list')[0],
        book = document.createElement('div'),
        bg,
        str;

    bg = 'bg-' + nextBG();

    book.className = 'book';
    book.setAttribute('data-key', obj.key);
    // 添加书籍名，其他信息
    str = bookStr.replace('{book-name}', obj.name)
        .replace('{author}', obj.author)
        .replace('{background}', bg);
    book.innerHTML = str;
    list.appendChild(book);
}

// 定义书籍的构造器
function Book(key, name, author, content) {
    'use strict';

    this.key = key;
    this.name = name;
    this.author = author;
    this.content = content;
}

// 获取下一张背景图序号
var nextBG = (function () {
    var number = 0;

    return function () {
        number += 1;
        return number % 5 + 1;
    }
}());

window.onload = function () {
    init();
};