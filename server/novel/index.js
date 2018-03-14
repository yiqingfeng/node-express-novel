/**
 * @description 获取某小说
 */

const Components = {
    'aiquxs': require('./aiquxs'),
};

class Novel {
    constructor(options) {
        const Component = Components[options.type];
        if (Component && options.url && options.name) {
            this.novel = new Component({
                url: options.url,
                name: options.name,
                callback: options.callback || null,
            });
        } else {
            options.error && options.error();
        }
    }
}

module.exports = Novel;
