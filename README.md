## node-express-novel


### 下载思路：

- 通过回调的方式逐步下载。（一个接一个）这种方式简单，但是速度太慢，这样被反爬虫的概率应该不大。

```javascript
getChapters(data, name, index) {
    const t = this;
    const len = data.length - 1;
    const curt = index || 0;
    const link = data[curt].link;
    const title = data[curt].title;
    if (len > curt) {
        return this.getChapter(link, title)
            .then(text => {
                fs
                    .appendFile(`${fs.distPath}/${name}.txt`, text)
                    .then(() => {
                        console.log(`${title}下载完毕`);
                        t.getChapters(data, name, curt + 1);
                    });
            });
    } else {
        return this.getChapter(link, title)
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
```

- 通过拆分组，开启多个时间，同时执行多个下载任务。这样下载时间会优化若干倍。

```javascript
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
```

- 优先下载章节文件，之后逐步合并

```javascript
// 下载小说章节
downloadChapters(data, tempPath, downloadCb) {
    const t = this;
    const len = data.length;
    let curt = 0;
    data.forEach((chapter, index) => {
        t.getChapter(chapter.link, chapter.title)
            .then(text => {
                fs.writeFile(`${tempPath}/${index}.txt`, text)
                    .then(() => {
                        curt++;
                        console.log(`${chapter.title}下载完毕`);
                        if (curt === len) {
                            downloadCb && downloadCb();
                        }
                    });
            });
    });
}

// 合并暂存区的章节文件
mergeChapters(tempPath, step, getName = index => `${index}.txt`, curt = 0) {
    const t = this;
    fs.readFile(`${tempPath}/${getName(curt)}`)
        .then(text => {
            fs.appendFile(`${t.distPath}/${t.name}.txt`, text)
                .then(() => {
                    if (curt < step - 1) {
                        t.mergeChapters(tempPath, step, getName, curt + 1);
                    } else {
                        console.log(`${colors.blue('章节合并完毕')}`);
                    }
                });
        });
}
```
