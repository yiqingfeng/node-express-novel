/**
 * @description 文件读写
 */
const fs = require('fs');
const path = require('path');

/**
 * -----------------------------------------------------------------------------------------
 * 文件相关操作
 * -----------------------------------------------------------------------------------------
 */
// 文件添加，异步地追加数据到一个文件，如果文件不存在则创建文件
const appendFile = (file, contents) => new Promise((resolve, reject) => {
    fs.appendFile(file, contents, 'utf8', err => err ? reject && reject(err) : resolve && resolve());
});
const appendFileSync = (file, contents) => {
    fs.appendFileSync(file, contents, 'utf8');
};
// 文件覆盖
const writeFile = (file, contents) => new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => err ? reject && reject(err) : resolve && resolve());
});
const writeFileSync = (file, contents) => {
    fs.writeFileSync(file, contents, 'utf8');
};
// 文件读取
const readFile = file => new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => err ? reject && reject(err) : resolve && resolve(data));
});
const readFileSync = file => fs.readFileSync(file, 'utf8');
// 文件删除
const rmFile = file => new Promise((resolve, reject) => {
    fs.unlink(file, err => err ? reject && reject(err) : resolve && resolve());
});
const rmFileSync = file => {
    fs.unlinkSync(file);
};
// 批量删除文件
const rmFiles = paths => new Promise((resolve, reject) => {
    let curt = 0;
    const len = paths.length;
    paths.forEach(path => {
        rmFile(path).then(() => {
            curt++;
            if (curt === len) {
                resolve && resolve();
            }
        }).catch(err => reject && reject(err));
    });
});

/**
 * -----------------------------------------------------------------------------------------
 * 文件夹相关操作
 * -----------------------------------------------------------------------------------------
 */
// 判断指定目录是否存在
const hasDir = dir => new Promise((resolve, reject) => {
    fs.stat(dir, (err, stat) => {
        if (err == null) {
            // 该文件夹已存在
            if (stat.isDirectory()) {
                resolve && resolve(true);
            } else {
                reject && reject('路径存在，但不是文件夹');
            }
        } else if (err.code == 'ENOENT') {
            resolve && resolve(false);
        } else {
            reject && reject(err);
        }
    })
});
// 不存在指定目录则新建
const makeDir = (dir) => new Promise((resolve, reject) => {
    hasDir.then(exists => {
        if (exists) {
            resolve && resolve();
        } else {
            fs.mkdir(dir, err => err ? reject && reject(err) : resolve && resolve());
        }
    }).catch(err => reject && reject(err));
});
// 删除空文件夹
const rmEmptyDir = path => new Promise((resolve, reject) => {
    fs.rmdir(path, err => err ? reject && reject(err) : resolve && resolve());
});
// 删除指定目录下的所有文件及其本身 (异步)
const rmDir = path => new Promise((resolve, reject) => {
    // 删除指定目录下的所有文件
    const rmAllFiles = path => {

    };
    hasDir.then(exists => {
        if (!exists) {
            resolve && resolve();
        } else {
            fs.readdir(path, 'utf8', (err, files) => {
                const tempFiles = [];
                const tempDirs = [];
                files.forEach(file => {
                    if (fs.statSync(`${path}/${file}`).isDirectory()) {
                        tempDirs.push(`${path}/${file}`);
                    } else {
                        tempFiles.push(`${path}/${file}`);
                    }
                });
                rmFiles()
            })
        }
    }).catch(err => reject && reject(err));
});

module.exports = {
    distPath: path.join(__dirname, '../../', 'dist'),
    tempPath: path.join(__dirname, '../../', 'temp'),

    appendFile,
    appendFileSync,
    writeFile,
    writeFileSync,
    readFile,
    readFileSync,
    rmFile,
    rmFileSync,
    rmFiles,

    hasDir,
    makeDir,
    rmEmptyDir,
};
