var bookStr = '<div class="book-head {background}"><div class="cover"><div class="cover-border"><div class="book-title">{book-name}</div></div></div><div class="mask-content"><div class="mak-top clear"><i class="icon-delete right" title="delete"></i><i class="icon-edit right modal-trigger" modal-target="edit-book-info" title="edit title and author"></i></div><div class="mask-bottom"><button class="open-book btn-flat">OPEN BOOK</button></div></div><div class="mask"></div></div><div class="book-body"><div class="author-box"><span>Author：</span><span>{author}</span></div></div><div class="book-control"></div>';

// 对应书籍列表页面的欢迎面板
var welcome = {
    isVisible: true
};

Object.defineProperty(welcome, 'visible', {
    set: function (val) {
        this.isVisible = val;
        var welcome = document.getElementsByClassName('welcome')[0];
        welcome.className = val ? 'welcome' : 'welcome hidden';
    }
});


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

// 编辑书籍信息按钮的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target,
            book,
            title = document.getElementById('book-title'), // title 输入框
            author = document.getElementById('book-author'), // author 输入框
            saveButton = document.getElementsByClassName('save-book-info')[0];
        if (target && target.nodeName.toLocaleLowerCase() === 'i' && target.className.indexOf('edit') !== -1) {
            book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;

            QiuModal.open('edit-book-info');
            title.value = book.firstElementChild
                .firstElementChild
                .firstElementChild
                .firstElementChild
                .innerHTML;
            author.value = book.firstElementChild
                .nextElementSibling
                .firstElementChild
                .lastElementChild
                .innerHTML;
            saveButton.setAttribute('data-key', book.getAttribute('data-key'));
        }
    });

// 删除书籍的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        var self = this;
        if (target && target.nodeName.toLocaleLowerCase() === 'i' && target.className.indexOf('delete') !== -1) {
            var book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;

            bookDB.open(
                function () {
                    var key = book.getAttribute('data-key');
                    bookDB.deleteBook(
                        key,
                        function () {
                            self.removeChild(book);
                            // 检查是否书籍列表是否为空，判断是否展示 welcome 面板
                            welcome.visible = document.getElementsByClassName('book').length === 0;

                            // 删除本地存储的阅读信息（进度、书签等）
                            bookMark.removeBookMarks(key); // 删除书签记录
                            currentLocation.clear(key); // 删除阅读进度信息
                        },
                        function () {
                            alert('删除书籍失败，请刷新重试');
                        }
                    );
                }
            );
        }
    });

// 打开书籍按钮的事件处理程序（事件委托）
document.getElementsByClassName('book-list')[0]
    .addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.nodeName.toLocaleLowerCase() === 'button' && target.className.indexOf('open-book') !== -1) {
            var book = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode;
            localStorage.setItem('reading', book.getAttribute('data-key')); // 更改阅读信息的存储位置
            location.href = 'reader.html';
        }
    });

// 编辑书籍信息模态框的Save按钮的事件处理程序
document.getElementsByClassName('save-book-info')[0]
    .addEventListener('click', function (e) {
        var saveButton = e.target,
            title = document.getElementById('book-title'), // title 输入框
            author = document.getElementById('book-author'), // author 输入框
            bookList = document.getElementsByClassName('book-list')[0],
            key = saveButton.getAttribute('data-key'),
            book,
            i;

        for (i = 0; i < bookList.childNodes.length; i++) {
            if (bookList.childNodes[i].nodeType === 1 && bookList.childNodes[i].getAttribute('data-key') === key) {
                book = bookList.childNodes[i];
                break;
            }
        }
        
        bookDB.open(function () {
            bookDB.getBook(
                key,
                function (result) { // result 为 indexedDB 中的 Book 对象
                    result.name = title.value;
                    result.author = author.value;

                    // 更新书籍信息（这回调好变态啊！）
                    bookDB.updateBook(
                        result,
                        function () {
                            book.firstElementChild
                                .firstElementChild
                                .firstElementChild
                                .firstElementChild
                                .innerHTML = title.value;
                            book.firstElementChild
                                .nextElementSibling
                                .firstElementChild
                                .lastElementChild
                                .innerHTML = author.value;
                            console.log('更新书籍信息成功');
                        },
                        function () {
                            alert('Can\'t update book, please try again.');
                        }
                    );

                },
                function () {
                    alert('保存信息失败，请刷新重试= =');
                }
            );
        });
    });

// welcome 面板隐藏按钮的事件处理程序
document.getElementById('welcome-close')
    .addEventListener('click', function () {
        welcome.visible = false;
    });

// 打开页面时初始化书籍列表
function init() {
    'use strict';

    bookDB.open(function () {
        bookDB.getBooks(
            function (books) {
                welcome.visible = books.length === 0;

                books.forEach(function (book) {
                    addBookToPage(book);
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

    welcome.visible = false; // 确保关闭了 welcome 面板
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
        number = (number % 5) ? number : 1;

        return number;
    }
}());

window.onload = function () {
    init();
    QiuModal.init(); // 初始化模态框
};