/**
 * @description 通过指定的json 章节文件获取对应的章节
 */

'use strick';

const EventEmitter = require('events');

const { fs, http, https, colors } = require('../tools/index');

class Chapters {
    /**
     * @param {{name String}} 小说名称
     * @param {{chapters Array}} 小说章节 [{title, link}]
     * @param {{filters Object}} 数据过滤器 {chapter}
     */
    constructor(options) {
        this.name = options.name || '';
        this.chapters = options.chapters || [];
        this.filters = options.filters || null;
        this.requset = options.type === 'https' ? https : http;
        this.distPath = options.distPath || fs.distPath;
        this.tempPath = options.tempPath || fs.tempPath;
        this.events = new EventEmitter();
        this.maxSection = 500; // 每卷最大章节数
        this.startUp();
    }

    // 开始执行任务
    startUp() {
        const t = this;
        fs.makeDir(t.tempPath)
            .then(() => {
                return fs.makeDir(`${t.tempPath}/${t.name}`)
                    .then(() => {
                        const chapters = t.filterChapter(t.chapters);
                        console.log(`开始下载${t.name}`);
                        t.downloadChapters(chapters, `${t.tempPath}/${t.name}`, () => {
                            console.log(`${t.name}下载完毕`);
                            if (chapters.length > t.maxSection) {
                                t.getSubsections(`${t.tempPath}/${t.name}`, t.distPath, chapters.length);
                            } else {
                                const filePath = `${t.distPath}/${t.name}.md`;
                                fs.writeFile(filePath, ``)
                                    .then(() => {
                                        t.mergeChapters(`${t.tempPath}/${t.name}`, filePath, chapters.length);
                                    })
                                    .catch(t.showError);
                            }

                        });
                    });
            })
            .catch(t.showError);
    }

    // 过滤不需要下载的章节
    filterChapter(data) {
        const chapters = [];
        const filter = (this.filters && this.filters.chapter) || (chapter => {
            if (/第(.)+章/g.test(chapter.title)) {
                return true;
            }
            return false;
        });
        data.forEach(chapter => {
            if (filter(chapter)) {
                chapters.push(chapter);
            }
        });
        return chapters;
    }

    // 格式化章节
    formatChapter(data) {
        //  爱去小说网
        let text = data.split('<!--go-->')[1];
        text = text.split('<!--over-->')[0];
        text = text.replace(/<BR>/g, '');
        text = text.replace(/(<br>|<br \/>)/g, '\n');
        text = text.replace(/&nbsp;/g, ' ');
        text = text.replace('天才壹秒記住『愛♂去÷小?說→網wWw.AiQuxS.Com』，為您提供精彩小說閱讀。\n', '');
        text = text.replace('手机用户请浏览m.aiquxs.com阅读，更优质的阅读体验。', '');
        return text;
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
                    return fs.writeFile(`${tempPath}/${index}.md`, text)
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

    // 获取小说章节
    getChapter(url, title) {
        const t = this;
        return this.requset.get(url)
            .then(res => {
                return new Promise(resolve => {
                    const filter = (t.filters && t.filters.content) || t.formatChapter;
                    const text = filter(res);
                    resolve && resolve(title ? `###${title}\n\n${text}\n\n` : `${text}\n\n`);
                });
            });
    }

    // 合并暂存区的章节文件
    mergeChapters(tempDir, distPath, step, getName = index => `${index}.md`, curt = 0) {
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
                            t.events.emit('finish', distPath, step);
                        }
                    });
            })
            .catch(t.showError);
    }

    // 文件分卷
    getSubsections(tempDir, distPath, steps) {
        const t = this;
        const maxSection = this.maxSection;
        const subsections = Math.ceil(steps / maxSection); // 分卷数

        let finishCount = 0, i;
        for(i = 0; i < subsections; i++) {
            this.getSubsection(tempDir, distPath, i, steps,
                () => {
                    finishCount++;
                    if (finishCount === subsections) {
                        console.log(`${colors.blue(`${t.name}分卷合并完毕`)}`);
                        t.clearDir(tempDir);
                        t.events.emit('finish');
                    }
                });
        }
    }

    // 获取某一个分卷的数据
    getSubsection(tempDir, distPath, order, steps, finishCb) {
        const t = this;
        const maxSection = this.maxSection;
        const filePath = `${distPath}/${t.name}第${order + 1}卷.md`;

        fs.writeFile(filePath, ``)
            .then(() => {
                t.mergeChaptersByList(tempDir, filePath, Math.min((order + 1) * maxSection, steps), finishCb, order * maxSection);
            })
            .catch(t.showError);
    }

    // 获取起止的文件
    mergeChaptersByList(tempDir, filePath, end, finishCb, curt = 0, getName = index => `${index}.md`) {
        const t = this;
        fs.readFile(`${tempDir}/${getName(curt)}`)
            .then(text => {
                return fs.appendFile(filePath, text)
                    .then(() => {
                        if (curt < end - 1) {
                            t.mergeChaptersByList(tempDir, filePath, end, finishCb, curt + 1, getName);
                        } else {
                            // console.log(`${colors.blue('该分卷合并完毕')}`);
                            finishCb && finishCb();
                        }
                    });
            })
            .catch(t.showError);
    }

    // 错误信息展示处理
    showError(err) {
        console.log(err);
    }

    // 清除指定目录
    clearDir(tempDir) {
        fs.rmDirSync(tempDir);
    }
}

module.exports = Chapters;
