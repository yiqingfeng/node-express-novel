/**
 * @description 获取某小说
 */
const cheerio = require('cheerio');
const mUrl = require('url');
const http = require('../tools/http');
const fs = require('../tools/fs');

class Novel {
    constructor(options) {
        this.baseUrl = 'http://www.aiquxs.com';
        this.cateUrl = options.url;
        this.name = options.name;
        this.distPath = options.distPath || fs.distPath;
        this.downloadCb = options.downloadCb;
        this.initialize();
    }

    initialize() {
        this.getCatelog(this.baseUrl + this.cateUrl);
    }

    // 获取目录信息
    getCatelog(url) {
        const t = this;
        return http.get(url)
            .then(res => {
                return new Promise((resolve, reject) => {
                    const $ = cheerio.load(res);
                    const text = [];
                    const chapters = $('#list a').map(() => {
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
                        .makeDir(t.distPath)
                        .then(() => {
                            t.createCatelog(text);
                            resolve && resolve(chapters);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            })
            .then(data => {
                fs
                    .writeFile(`${t.distPath}/${t.name}.txt`, `${t.name}\n\n`)
                    .then(() => {
                        t.getChapters(t.filterChapter(data));
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.debug(err);
            });
    }

    // 记录目录信息
    createCatelog(chapters) {
        console.log(`开始写入${t.name}目录`);
        fs
            .writeFile(`${t.distPath}/${t.name}目录.txt`, chapters.join(''))
            .then(() => {
                console.log(`${t.name}目录生成完毕`);
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

    // 获取小说章节
    getChapter(url) {
        return http.get(url)
            .then(res => {
                return new Promise(resolve => {
                    let text = res.split('<!--go-->')[1];
                    text = text.split('<!--over-->')[0];
                    text = text.replace(/<BR>/g, '');
                    text = text.replace(/(<br>|<br \/>)/g, '\n');
                    text = text.replace(/&nbsp;/g, ' ');
                    text = text.replace('天才壹秒記住『愛♂去÷小?說→網wWw.AiQuxS.Com』，為您提供精彩小說閱讀。\n', '');
                    text = text.replace('手机用户请浏览m.aiquxs.com阅读，更优质的阅读体验。', '');
                    text = `${t.name}\n\n${text}\n\n`;
                    resolve && resolve(text);
                });
            });
    }

    // 获取多有小说章节，并下载保存
    getChapters(data, index) {
        const t = this;
        const len = data.length - 1;
        const curt = index || 0;
        if (len > curt) {
            return this.getChapter(data[curt].link, data[curt].title)
                .then(text => {
                    fs
                        .appendFile(`${t.distPath}/${t.name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            t.getChapters(data, curt + 1);
                        });
                });
        } else {
            return this.getChapter(data[curt].link, data[curt].title)
                .then(text => {
                    fs
                        .appendFile(`${t.distPath}/${t.name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            console.log(`${t.name}下载完毕`);
                            t.downloadCb && t.downloadCb();
                        });
                });
        }
    }
}

module.exports = Novel;
