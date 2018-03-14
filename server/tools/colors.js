/**
 * @description 用于console样式输出，可以使用第三方安装包
 * http://justnewbee.github.io/frontend/2014/12/17/nodejs-colorful-console.html
 * https://www.npmjs.com/package/colors
 */

module.exports = {
    /**
     * -----------------------------------------------
     * 前景色
     * -----------------------------------------------
     */
    black(str) {
        return `\x1b[30m${str}\x1b[0m`;
    },
    red(str) {
        return `\x1b[31m${str}\x1b[0m`;
    },
    green(str) {
        return `\x1b[32m${str}\x1b[0m`;
    },
    yellow(str) {
        return `\x1b[33m${str}\x1b[0m`;
    },
    blue(str) {
        return `\x1b[34m${str}\x1b[0m`;
    },
    // 洋红色
    magenta(str) {
        return `\x1b[35m${str}\x1b[0m`;
    },
    // 青色
    cyan(str) {
        return `\x1b[36m${str}\x1b[0m`;
    },
    white(str) {
        return `\x1b[37m${str}\x1b[0m`;
    },

    /**
     * -----------------------------------------------
     * 背景色
     * -----------------------------------------------
     */
    bgBlack(str) {
        return `\x1b[40m${str}\x1b[0m`;
    },
    bgRed(str) {
        return `\x1b[41m${str}\x1b[0m`;
    },
    bgGreen(str) {
        return `\x1b[42m${str}\x1b[0m`;
    },
    bgYellow(str) {
        return `\x1b[43m${str}\x1b[0m`;
    },
    bgBlue(str) {
        return `\x1b[44m${str}\x1b[0m`;
    },
    bgMagenta(str) {
        return `\x1b[45m${str}\x1b[0m`;
    },
    bgCyan(str) {
        return `\x1b[46m${str}\x1b[0m`;
    },
    bgWhite(str) {
        return `\x1b[47m${str}\x1b[0m`;
    },
}
