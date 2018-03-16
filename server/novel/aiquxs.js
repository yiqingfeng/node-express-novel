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
        this.tempPath = options.tempPath || fs.tempPath;
        this.downloadCb = options.downloadCb;
        this.getCatelog(this.baseUrl + options.url);
    }

    // 获取目录信息
    getCatelog(url) {
        const t = this;
        return http.get(url)
            .then(res => {
                return new Promise(resolve => {
                    const { chapters } = t.formatCatelog(res, url);
                    fs.makeDir(t.distPath)
                        .then(() => {
                            // t.createCatelog(text);
                            resolve && resolve(chapters);
                        })
                        .catch(t.showError);
                });
            })
            .then(data => {
                return fs.makeDir(`${fs.tempPath}/${t.name}`)
                    .then(() => {
                        const chapters = t.filterChapter(data);
                        console.log(`开始下载${t.name}`);
                        t.downloadChapters(chapters, `${fs.tempPath}/${t.name}`, () => {
                            console.log(`${t.name}下载完毕`);
                            const filePath = `${t.distPath}/${t.name}.txt`;
                            fs.writeFile(filePath, `${t.name}\n\n`)
                                .then(() => {
                                    t.mergeChapters(`${fs.tempPath}/${t.name}`, filePath, chapters.length);
                                })
                                .catch(t.showError);
                        });
                    });
            })
            .catch(t.showError);
    }

    // 记录目录信息
    createCatelog(text) {
        const t = this;
        console.log(`开始写入${t.name}目录`);
        fs.writeFile(`${t.distPath}/${t.name}目录.txt`, text)
            .then(() => {
                console.log(`${t.name}目录生成完毕`);
            })
            .catch(err => {
                console.log(err);
            });
    }

    // 格式化目录
    formatCatelog(data, curtUrl) {
        const $ = cheerio.load(data);
        let text = '';
        const chapters = [];
        // jQuery对象的 map 方法不要使用箭头函数，会影响 this
        $('#list a').map(function () {
            const link = URL.resolve(curtUrl, $(this).attr('href'));
            const title = $(this).text();
            const data = {
                link,
                title,
            };
            text += JSON.stringify(data);
            chapters.push(data);
        });
        return {
            text,
            chapters,
        };
    }

    // 格式化章节
    formatChapter(data) {
        let text = data.split('<!--go-->')[1];
        text = text.split('<!--over-->')[0];
        text = text.replace(/<BR>/g, '');
        text = text.replace(/(<br>|<br \/>)/g, '\n');
        text = text.replace(/&nbsp;/g, ' ');
        text = text.replace('天才壹秒記住『愛♂去÷小?說→網wWw.AiQuxS.Com』，為您提供精彩小說閱讀。\n', '');
        text = text.replace('手机用户请浏览m.aiquxs.com阅读，更优质的阅读体验。', '');
        return text;
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

    // 错误信息展示处理
    showError(err) {
        console.log(err);
    }

    // 获取小说章节
    getChapter(url, title) {
        const t = this;
        return http.get(url)
            .then(res => {
                return new Promise(resolve => {
                    const text = t.formatChapter(res)
                    resolve && resolve(title ? `${title}\n${text}\n\n` : `${text}\n\n`);
                });
            });
    }

    // 下载小说章节
    downloadChapters(data, tempPath, downloadCb) {
        const t = this;
        const len = data.length;
        const progressBar = colors.progress(len, `当前章节下载进度: :current / ${len}`);
        let curt = 0;
        data.forEach((chapter, index) => {
            t.getChapter(chapter.link, chapter.title)
                .then(text => {
                    return fs.writeFile(`${tempPath}/${index}.txt`, text)
                        .then(() => {
                            curt++;
                            progressBar.tick();
                            // console.log(`${chapter.title}下载完毕`);
                            if (curt === len) {
                                downloadCb && downloadCb();
                            }
                        });
                })
                .catch(t.showError);
        });
    }

    // 合并暂存区的章节文件
    mergeChapters(tempDir, distPath, step, getName = index => `${index}.txt`, curt = 0) {
        const t = this;
        fs.readFile(`${tempDir}/${getName(curt)}`)
            .then(text => {
                return fs.appendFile(distPath, text)
                    .then(() => {
                        if (curt < step - 1) {
                            t.mergeChapters(tempDir, distPath, step, getName, curt + 1);
                        } else {
                            console.log(`${colors.blue('章节合并完毕')}`);
                            t.clearDir(tempDir);
                        }
                    });
            })
            .catch(t.showError);
    }

    // 清除指定目录
    clearDir(tempDir) {
        fs.rmDirSync(tempDir);
    }
}

module.exports = Novel;
