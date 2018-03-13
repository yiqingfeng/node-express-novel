/**
 * @description 文件读写
 */
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const writeFile = (file, contents) => new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => err ? reject(err) : resolve());
});

// 不存在指定目录则新建
const makeDir = (dir) => new Promise((resolve, reject) => {
    fs.stat(dir, function (err, stat) {
        if (err == null) {
            // 该文件夹已存在
            if (stat.isDirectory()) {
                resolve();
            } else {
                console.log('路径存在，但不是文件夹');
            }
        } else if (err.code == 'ENOENT') {
            fs.mkdir(dir, err => err ? reject(err) : resolve());
        } else {
            resolve(err);
        }
    });
});

// 异步地追加数据到一个文件，如果文件不存在则创建文件
const appendFile = (file, contents) => new Promise((resolve, reject) => {
    fs.appendFile(file, contents, 'utf8', err => err ? reject(err) : resolve());
});

const appendFileSync = (file, contents) => {
    fs.appendFileSync(file, contents, 'utf8');
};

const readFile = file => new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => err ? reject(err) : resolve(data));
});

const readFileSync = file => new Promise((resolve, reject) => {
    const article = fs.readFileSync(file, 'utf8');
    resolve(article);
});

module.exports = {
    writeFile,
    makeDir,
    appendFile,
    readFile,
    appendFileSync,
    readFileSync,
    distPath: path.join(__dirname, '../', 'dist'),
    decode(buffer, type) {
        return iconv.decode(buffer, type);
    }
};
