(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SDB = factory());
}(this, (function () { 'use strict';

    function debug (msg) {
        config.debugMode && console.warn("[DEBUG]", msg);
    }

    var config = {
        debugMode: true
    };

    /**
     * 对 data 中的每个 prop 调用 defineReactive
     */
    function observe (data) {
        Object.keys(data).forEach(function (prop) {
            defineReactive(data, prop);
        });
    }

    /**
     * 将 obj.prop 变为 accessor
     */
    function defineReactive (obj, prop) {
        var preValue = obj[prop];
        Object.defineProperty(obj, prop, {
            get: function () {
                debug(`用 $data.${prop} 调用了 getter`);
                return preValue;
            },
            set: function (newValue) {
                debug(`用 $data.${prop} 调用了 setter`);
                if (preValue === newValue) return null;
                preValue = newValue;
            }
        });
    }

    function compile (vm, el) {
        debug(`SDB: ${vm}, SDB.$el: ${el}`);
    }

    function SDB (options) {
        this._init(options);
        this._observe();
        this._proxy();
        this._compile();
    }

    SDB.config = config;

    /**
     * 对外暴露一些 options.prop
     */
    SDB.prototype._init = function (options) {
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
    };

    /**
     * 将 SDB.$data 中的 prop 设置为 accessor
     */
    SDB.prototype._observe = function () {
        observe(this.$data);
    };

    /**
     * 为 SDB 设置与 SDB.$data 同名的属性
     * 作为其代理访问相应的值
     */
    SDB.prototype._proxy = function () {
        var self = this;
        Object.keys(this.$data).forEach(function (prop) {
            Object.defineProperty(self, prop, {
                get: function () {
                    return self.$data[prop];
                },
                set: function (newValue) {
                    self.$data[prop] = newValue;
                }
            });
        });
    };

    /**
     * 解析 SDB.$el 及其 childNodes 中的 textNode
     * 为每个有效的 token 设置一个 Watcher
     */
    SDB.prototype._compile = function () {
        compile(this, this.$el);
    };

    /**
     * 用于判断一个对象是否为 SDB 的实例
     */
    SDB.prototype.toString = function () {
        return "[SDB instance]";
    };

    return SDB;

})));
