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
                connection.query('SELECT * FROM book_source WHERE id != 1 ORDER BY id DESC', (err, results) => {
                    connection.release(); // And done with the connection.
                    if (err) {
                        reject && reject(err);
                    } else {
                        resolve && resolve(results);
                    }
                })
            });
        });
    }
}
