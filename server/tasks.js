/**
 * @description 执行相关操作
 */

const Novel = require('./novel/index');

/**
 * @param {type, url, name, downloadCb} options
 */
module.exports.addNovel = options => {
    return new Novel(options);
};
