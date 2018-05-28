/**
 * @description 从2k小说网下载
 */
const Base  = require('./base');

class Novel extends Base {

}

new Novel({
    name: '杀神',
    url: '/xiaoshuo/0/35/',
})

module.exports = Novel;
