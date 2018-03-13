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

- 通过拆分，开启多个时间，同时执行多个下载任务。这样下载时间会优化若干倍。

```javascript
getChapters(data, name, index) {

}
```
