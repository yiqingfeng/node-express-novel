/**
 * @description http相关操作
 */

const http = require('http');
const iconv = require('iconv-lite');
const colors = require('./colors');

exports.get = function get(url, type) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let html = '';
            // 监听data事件，每次取一块数据
            res.on('data', chuck => {
                html += iconv.decode(chuck, type || 'gb2312');
            });
            // 监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', () => {
                resolve && resolve(html);
            });
        }).on('error', e => {
            console.log(`${colors.bgRed('Error:')} 请求出错，url: ${colors.blue(url)}}`, e);
            reject && reject(e);
        });
    });
}
