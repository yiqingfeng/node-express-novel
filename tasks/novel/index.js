/**
 * @description 获取某小说
 */
const http = require('http');
const cheerio = require('cheerio');
const mUrl = require('url');
const fs = require('../fs');

class Novel {
    constructor(options) {
        this.baseUrl = 'http://www.aiquxs.com';
        this.cateUrl = options.url;
        this.getCatelog(this.baseUrl + this.cateUrl, '玄界之门');
    }

    get(url) {
        return new Promise((resolve, reject) => {
            http.get(url, res => {
                let html = '';
                // 监听data事件，每次取一块数据
                res.on('data', chuck => {
                    html += fs.decode(chuck, 'gb2312');
                });
                // 监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
                res.on('end', () => {
                    resolve && resolve(html);
                });
            }).on('error', e => {
                console.debug(e);
                reject && reject(e);
            });
        });
    }

    // 获取目录信息
    getCatelog(url, name) {
        return this.get(url)
            .then(res => {
                return new Promise((resolve) => {
                    const $ = cheerio.load(res);
                    const text = [];
                    const chapters = $('#list a').map(function () {
                        const link = mUrl.resolve(url, $(this).attr('href'));
                        const title = $(this).text();
                        const data = {
                            link,
                            title,
                        };
                        text.push(JSON.stringify(data));
                        return data;
                    });
                    console.log(`开始写入${name}目录`);
                    fs
                        .writeFile(`${fs.distPath}/${name}目录.txt`, text.join(''))
                        .then(() => {
                            console.log(`${name}目录生成完毕`);
                        });
                    resolve && resolve(chapters);
                });
            })
            .then((data) => {
                console.log(data[0]);
            });
    }

}

module.exports = Novel;
