/**
 * @description 文件读写
 */
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
// const mkdir = require('mkdir');

const writeFile = (file, contents) => new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => err ? reject(err) : resolve());
});

const makeDir = (name) => new Promise((resolve, reject) => {
    // mkdirp(name, err => err ? reject(err) : resolve());+*
});

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
