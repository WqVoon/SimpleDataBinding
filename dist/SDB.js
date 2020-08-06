(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SDB = factory());
}(this, (function () { 'use strict';

    function debug (msg, showTrace=false) {
        config.debugMode && console.warn("[DEBUG]", msg);
        showTrace && console.trace();
    }

    function isTextNode(el) {
        return el.nodeType === 3;
    }

    function copyArray (preArray) {
        return Array.prototype.slice.call(preArray);
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
        debug("开始编译 DomTree");
        scanSelfAndChildNodes(el);
        debug("DomTree 编译结束");
    }

    /**
     * 遍历当前 node 以及其子节点
     * 在遇到 textNode 时对其调用 handleTextNode
     */
    function scanSelfAndChildNodes(el) {
        isTextNode(el) && handleTextNode(el);

        copyArray(el.childNodes).forEach(function (node) {
            scanSelfAndChildNodes(node);
        });
    }

    /**
     * 处理 textNode
     */
    function handleTextNode(el) {
        var tokens = parseText(el.wholeText);
        if (!! tokens.haveValidToken) {
            var frag = document.createDocumentFragment();
            tokens.forEach(function (textContent) {
                var tmpToken = textContent.isValidToken?
                    createValidTextNode(el): document.createTextNode(el);
                frag.appendChild(tmpToken);
            });
            el.parentNode.replaceChild(frag, el);
        }
    }

    /**
     * 对有效的 token 在生成 textNode 的同时绑定一个 Watcher 对象
     */
    function createValidTextNode (el) {
        var textNode = document.createTextNode(el);
        return textNode;
    }

    /**
     * parseText 函数切分字符串时使用的正则
     */
    var reg = /{{([^{}]+)}}/g;

    /**
     * 将 str 根据 {{...}} 来拆分成多个 token 并返回
     * {{...}} 的 token 其 isValidToken 属性为 true，其他 token 没有该属性
     * 如果存在具有 tag 属性的 token ，那么返回的数组中属性 haveValidToken 为 true
     */
    function parseText(str) {
        var result = null, tokens = [], preIndex = 0;
        debug(`开始解析 ${str}`);

        while (!! (result = reg.exec(str))) {
            if (result.index > preIndex)
                tokens.push(str.slice(preIndex, result.index));

            var tokenName = result[1];
            debug(` - ${tokenName}(${typeof tokenName}) 是一个有效 token`);
            tokenName.isValidToken = true;
            tokens.push(result[1]);
            preIndex = reg.lastIndex;
            tokens.haveValidToken = true;
        }
        preIndex === str.length || tokens.push(str.slice(preIndex));

        debug(`tokens(${tokens.length}): ${tokens.join('|')}`);
        return tokens;
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
