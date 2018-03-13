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
        this.name = options.name;
        this.callback = options.callback;
        this.getCatelog(this.baseUrl + this.cateUrl, this.name);
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
        const t = this;
        return this.get(url)
            .then(res => {
                return new Promise((resolve, reject) => {
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
                    fs
                        .makeDir(fs.distPath)
                        .then(() => {
                            console.log(`开始写入${name}目录`);
                            fs
                                .writeFile(`${fs.distPath}/${name}目录.txt`, text.join(''))
                                .then(() => {
                                    console.log(`${name}目录生成完毕`);
                                })
                                .catch(err => {
                                    console.debug(err);
                                });
                            resolve && resolve(chapters);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            })
            .then((data) => {
                fs.writeFile(`${fs.distPath}/${name}.txt`, '这是测试文件')
                    .then(() => {
                        t.getChapters(t.filterChapter(data), name);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.debug(err);
            });
    }

    // 过滤不需要下载的章节
    filterChapter(data) {
        return (data || []).filter(chapter => {
            if (/第(.)+章/g.test(chapter.title)) {
                return true;
            }
            return false;
        });
    }

    // 获取多有小说章节，并下载保存
    getChapters(data, name, index) {
        const t = this;
        const len = data.length - 1;
        const curt = index || 0;
        if (len > curt) {
            return this.getChapter(data[curt].link, data[curt].title)
                .then(text => {
                    fs
                        .appendFile(`${fs.distPath}/${name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            t.getChapters(data, name, curt + 1);
                        });
                });
        } else {
            return this.getChapter(data[curt].link, data[curt].title)
                .then(text => {
                    fs
                        .appendFile(`${fs.distPath}/${name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            console.log(`${name}下载完毕`);
                        });
                });
        }
    }
    // 获取小说章节
    getChapter(url, name) {
        return this.get(url)
            .then(res => {
                return new Promise(resolve => {
                    let text = res.split('<!--go-->')[1];
                    text = text.split('<!--over-->')[0];
                    text = text.replace(/<BR>/g, '');
                    text = text.replace(/(<br>|<br \/>)/g, '\n');
                    text = text.replace(/&nbsp;/g, ' ');
                    text = text.replace('天才壹秒記住『愛♂去÷小?說→網wWw.AiQuxS.Com』，為您提供精彩小說閱讀。\n', '');
                    text = text.replace('手机用户请浏览m.aiquxs.com阅读，更优质的阅读体验。', '');
                    text = `${name}\n\n${text}\n\n`;
                    resolve && resolve(text);
                });
            });
    }

}

module.exports = Novel;
