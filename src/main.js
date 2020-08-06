export default function SDB (options) {
    this._init(options);
}

SDB.prototype._init = function (options) {
    /**
     * 利用 options 中的 props 对 SDB 对象进行一些初始化
     */
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
}