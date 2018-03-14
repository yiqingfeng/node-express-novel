/**
 * @description 获取某小说
 */
const URL = require('url');
const cheerio = require('cheerio');

const fs = require('../tools/fs');
const http = require('../tools/http');
const colors = require('../tools/colors');

class Novel {
    constructor(options) {
        this.baseUrl = 'http://www.aiquxs.com';
        this.name = options.name;
        this.distPath = options.distPath || fs.distPath;
        this.downloadCb = options.downloadCb;
        this.initialize(options.url);
    }

    initialize(url) {
        this.getCatelog(this.baseUrl + url);
    }

    // 获取目录信息
    getCatelog(url) {
        const t = this;
        return http.get(url)
            .then(res => {
                return new Promise((resolve, reject) => {
                    const $ = cheerio.load(res);
                    const text = [];
                    const chapters = [];
                    // jQuery对象的 map 方法不要使用箭头函数，会影响 this
                    $('#list a').map(function () {
                        const link = URL.resolve(url, $(this).attr('href'));
                        const title = $(this).text();
                        const data = {
                            link,
                            title,
                        };
                        text.push(JSON.stringify(data));
                        chapters.push(data);
                    });
                    fs
                        .makeDir(t.distPath)
                        .then(() => {
                            t.createCatelog(text.join(''));
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
                        // t.getChapters(t.filterChapter(data), `temp/${t.name}-1`);
                        // 将数据分为多份额进行处理
                        fs
                            .makeDir(`${fs.tempPath}/${t.name}`)
                            .then(() => {
                                t.downloadPriority(t.filterChapter(data).slice(0, 10), `${fs.tempPath}/${t.name}`);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }

    // 记录目录信息
    createCatelog(text) {
        const t = this;
        console.log(`开始写入${t.name}目录`);
        fs
            .writeFile(`${t.distPath}/${t.name}目录.txt`, text)
            .then(() => {
                console.log(`${t.name}目录生成完毕`);
            })
            .catch(err => {
                console.log(err);
            });
    }

    // 过滤不需要下载的章节
    filterChapter(data) {
        const chapters = [];
        data.forEach(chapter => {
            if (/第(.)+章/g.test(chapter.title)) {
                chapters.push(chapter);
            }
        });
        return chapters;
    }

    // 获取小说章节
    getChapter(url, name) {
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
                    text = `${name}\n\n${text}\n\n`;
                    resolve && resolve(text);
                });
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
                        .appendFile(`${t.distPath}/${name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            t.getChapters(data, curt + 1);
                        });
                });
        } else {
            return this.getChapter(data[curt].link, data[curt].title)
                .then(text => {
                    fs
                        .appendFile(`${t.distPath}/${name}.txt`, text)
                        .then(() => {
                            console.log(`${data[curt].title}下载完毕`);
                            console.log(`${name}下载完毕`);
                            t.downloadCb && t.downloadCb();
                        });
                });
        }
    }

    // 快速下载书籍
    createchaptersFast(data) {
        const step = 5;
        const len = Math.floor(data.length / step);
        const p = [];
        let start, end, list;
        for (let i = 0; i < step; i++) {
            start = i * len;
            if (step !== i + 1) {
                end = (i + 1) * len;
                list = data.slice(start, end);
            } else {
                list = data.slice(start);
            }
            p.push(this.getChapters(list, `temp/${t.name}-${i}`));
        }
        return Promise.all(p)
            .then(() => {
                // 合并生成的章节
            })
    }

    // 优先下载章节
    downloadPriority(data, path) {
        const t = this;
        return Promise.all(data.forEach((chapter, index) => {
            return t.getChapter(chapter.link, chapter.title).then(text => {
                fs
                    .writeFile(`${path}/${index}.txt`, text)
                    .then(() => {
                        console.log(`${chapter.title}下载完毕`);
                    });
            });
        }));
    }
}

module.exports = Novel;
