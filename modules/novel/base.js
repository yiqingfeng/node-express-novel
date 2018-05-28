/**
 * @description 从2k小说网下载
 */
const URL = require('url');
const cheerio = require('cheerio');

const Chapters = require('../chapters');
const { fs, https } = require('../tools/index');

class Novel {
    constructor(options) {
        this.name = options.name;
        this.distPath = options.distPath || fs.distPath;
        this.tempPath = options.tempPath || fs.tempPath;
        this.initialize();
        this.startUp(options.url);
    }

    initialize() {
        this.baseUrl = 'https://www.2kxs.com';
        this.filters = {
            content(data) {
                // 2k小说网
                let text = data.split('<script language="javascript">tongzhi();</script>')[1];
                text = text.split('2k小说阅读网</p>')[0];
                text = text.replace(/(<BR>|%%%|&nbsp;&nbsp;&nbsp;&nbsp;)/g, '');
                text = text.replace(/(<br>|<br \/>)/g, '\n');
                text = text.replace(/&nbsp;/g, ' ');
                return text;
            },
        };
    }

    // 错误信息展示处理
    showError(err) {
        console.log(err);
    }

    // 启动
    startUp(url) {
        const cateUrl = this.baseUrl + url;
        // 获取目录信息
        https.get(cateUrl)
            .then(res => {
                this.getCatelog(cateUrl, res);
            })
            .catch(this.showError);
    }

    // 获取目录信息
    getCatelog(url, res) {
        const t = this;
        const { chapters } = t.formatCatelog(res, url);
        return fs.makeDir(t.distPath)
            .then(() => {
                // t.createCatelog(text);
                t.getCharpters(chapters);
            })
            .catch(t.showError);
    }

    // 获取章节
    getCharpters(list) {
        const t = this;
        const url = URL.parse('https://www.2kxs.com');
        const chapters = new Chapters({
            name: t.name,
            chapters: list,
            filters: t.filters,
            type: url.protocol.substr(0, url.protocol.length - 1),
            distPath: t.distPath,
            tempPath: t.tempPath,
        });
        chapters.events.on('finish', () => {

        });
    }

    // 格式化目录
    formatCatelog(data, curtUrl) {
        const $ = cheerio.load(data);
        let text = '';
        const chapters = [];
        // jQuery对象的 map 方法不要使用箭头函数，会影响 this
        $('.book a').map(function (index) {
            if (index < 4) return;

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

    //
}

module.exports = Novel;
