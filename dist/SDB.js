(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SDB = factory());
}(this, (function () { 'use strict';

    function SDB (options) {
        this._init(options);
    }

    SDB.prototype._init = function (options) {
        /**
         * 利用 options 中的 props 对 SDB 对象进行一些初始化
         */
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
    };

    return SDB;

})));
