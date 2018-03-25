const mysql = require('mysql');
const { colors } = require('../tools');
const { sqlConfig } = require('../config/settings.json');

const pool = mysql.createPool(sqlConfig);

module.exports = {
    getConnection() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.log(`${colors.red('Error')}: 数据库连接失败`);
                    reject && reject(err);
                } else {
                    resolve && resolve(connection);
                }
            });
        })
    },
    getAllBookSource() {
        return this.getConnection().then(connection => {
            return new Promise((resolve, reject) => {
                connection.query('SELECT * FROM book_source ORDER BY id DESC', (err, results) => {
                    connection.release(); // And done with the connection.
                    if (err) {
                        reject && reject(err);
                    } else {
                        resolve && resolve(results);
                    }
                })
            });
        });
    },
    getALlBooks() {
        return this.getConnection().then(connection => {
            return new Promise((resolve, reject) => {
                connection.query('SELECT b.name, b.author, b.url, b.update_time, b.remark, s.name as source FROM book as b LEFT JOIN book_source as s ON b.source_id = s.id ORDER BY b.id DESC', (err, results) => {
                    connection.release(); // And done with the connection.
                    if (err) {
                        reject && reject(err);
                    } else {
                        resolve && resolve(results);
                    }
                })
            });
        });
    },
    addBook(data) {
        const { name, author, url, source_id, remark } = data;
        const book = {
            name,
            author,
            url,
            source_id,
            remark,
        };
        book.update_time = Date.now();
        console.log(book);
        return this.getConnection().then(connection => {
            return new Promise((resolve, reject) => {
                connection.query('INSERT INTO book SET ?', book, (err, results) => {
                    connection.release(); // And done with the connection.
                    if (err) {
                        reject && reject(err);
                    } else {
                        resolve && resolve(results);
                    }
                })
            });
        });
    },
}
