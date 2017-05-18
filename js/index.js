var bookStr = '';

var book = null;

document.getElementById('add-book')
    .addEventListener('change', function (e) {

        var firstFile = e.target.files[0];

        if (window.FileReader) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(firstFile);

            reader.onload = function (e) {
                book = ePub({
                    bookPath: e.target.result
                });

                book.getMetadata().then(function (metadata) {
                    var key = metadata.identifier,
                        name = metadata.bookTitle,
                        author = metadata.creator,
                        // description = metadata.description,
                        article = new Book(key, name, author, e.target.result);

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

function addBookToPage(obj) {
    'use strict';

    var list = document.getElementsByClassName('book-list')[0],
        book = document.createElement('div');

    book.className = 'book';
    book.setAttribute('data-key', obj.key);
    // 添加书籍名，其他信息
    book.innerHTML = bookStr;
    list.appendChild(book);
}

function Book(key, name, author, content) {
    'use strict';

    this.key = key;
    this.name = name;
    this.author = author;
    this.content = content;
}