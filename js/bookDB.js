(function (log, win) {
    'use strict';

    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var db;
    var bookDB = win.bookDB = {};
    var isOpened = bookDB.isOpened = false;

    var request = indexedDB.open("books");

    request.onupgradeneeded = function (e) {
        db = e.target.result;
        isOpened = true;
        db.createObjectStore('books', {
            keyPath: 'key'
        });
        db.close();
    };

    var open = bookDB.open = function (success, error) {
        var request = indexedDB.open("books");

        request.onsuccess = function (e) {
            db = e.target.result;
            isOpened = true;
            success();
        };

        request.onerror = error || function () {
                log('Can\'t open database');
            };
    };

    var addBook = bookDB.addBook = function (book, success, error) {

        var t = db.transaction('books', 'readwrite');
        var store = t.objectStore('books');
        var req = store.put(book);

        req.onsuccess = success || null;
        req.onerror = error || null;
    };

    var deleteBook = bookDB.deleteBook = function (key, success, error) {

        var t = db.transaction('books', 'readwrite');
        var store = t.objectStore('books');
        var req = store.delete(key);

        req.onsuccess = success || null;
        req.onerror = error || null;
    };

    var getBook = bookDB.getBook = function (key, success, error) {

        var t = db.transaction('books', 'readonly');
        var store = t.objectStore('books');
        var req = store.get(key);

        if (success) {
            req.onsuccess = function (e) {
                success(e.target.result);
            };
        }

        req.onerror = error || null;
    };

    var getBooks = bookDB.getBooks = function (success, error) {
        var t = db.transaction('books', 'readonly');
        var store = t.objectStore('books');
        var req = store.openCursor();
        var result = [];

        req.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
                result.push(cursor.value);
                cursor.continue();
            } else {
                success(result);
            }
        };

        req.onerror = error || null;
    };

    var updateBook = bookDB.updateBook = function (book, success, error) {
        addBook(book, success, error);
    };

}(window.console.log, window));