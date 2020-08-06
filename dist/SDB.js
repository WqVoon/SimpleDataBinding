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
        debugMode: false
    };

    function Dep () {
        this._init();
    }

    Dep.target = null;

    Dep.prototype._init = function () {
        this.subs = [];
    };

    Dep.prototype._addWatcher = function (w) {
        this.subs.push(w);
    };

    /**
     * 通知 this.subs 中的所有 Watcher 执行更新
     */
    Dep.prototype.notify = function () {
        debug(`调用了 Dep.notify`);
        this.subs.forEach(function (w) {
            w.update();
        });
    };

    /**
     * 如果 Dep.target 尚未与某个 Dep 绑定，则与它建立绑定关系
     */
    Dep.prototype.depend = function () {
        debug(`调用了 Dep.depend`);
        if (! Dep.target.depended) {
            this._addWatcher(Dep.target);
            Dep.target.depended = true;
        }
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
        var dep = new Dep();
        Object.defineProperty(obj, prop, {
            get: function () {
                debug(`用 $data.${prop} 调用了 getter`);
                Dep.target && dep.depend();
                return preValue;
            },
            set: function (newValue) {
                debug(`用 $data.${prop} 调用了 setter`);
                if (preValue === newValue) return null;
                preValue = newValue;
                dep.notify();
            }
        });
    }

    function compile (vm, el) {
        debug("开始编译 DomTree");
        compile.vm = vm;
        scanSelfAndChildNodes(el);
        vm._watchers.forEach(function (w) {
            w.bind();
        });
        debug("DomTree 编译结束");
    }

    /**
     * 遍历当前 node 以及其子节点；
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
            tokens.forEach(function (token) {
                var tmpNode = token.isValid?
                    createValidTextNode(token.value):
                    document.createTextNode(token.value);
                frag.appendChild(tmpNode);
            });
            el.parentNode.replaceChild(frag, el);
        }
    }

    /**
     * 对有效的 token 在生成 textNode 的同时绑定一个 Watcher 对象
     */
    function createValidTextNode (textContent) {
        debug(`用 ${textContent} 调用了 createValidTextNode`);
        var textNode = document.createTextNode(compile.vm[textContent]);
        compile.vm._addWatcher(textContent, textNode);
        return textNode;
    }

    /**
     * parseText 函数切分字符串时使用的正则
     */
    var reg = /{{([^{}]+)}}/g;

    /**
     * 将 str 根据 {{...}} 来拆分成多个 token 并返回；
     * {{...}} 的 token 其 isValid 属性为 true，其他 token 该属性为 false；
     * 如果存在 isValid 属性为 true 的 token ，那么返回的数组中属性 haveValidToken 为 true
     */
    function parseText(str) {
        var result = null, tokens = [], preIndex = 0;
        debug(`开始解析 ${str}`);

        while (!! (result = reg.exec(str))) {
            if (result.index > preIndex) {
                var value = str.slice(preIndex, result.index);
                tokens.push(makeToken(value, false));
            }

            debug(` - ${result[1]} 是一个有效 token`);
            tokens.push(makeToken(result[1].trim(), true));
            preIndex = reg.lastIndex;
            tokens.haveValidToken = true;
        }
        preIndex === str.length || tokens.push(makeToken(str.slice(preIndex), false));

        debug(`解析结果: tokens(${tokens.length}): ${tokens.join('|')}`);
        return tokens;
    }

    /**
     * 制作一个对象用于存储 token 的信息
     */
    function makeToken (value, isValid) {
        return {
            value: value,
            isValid: isValid,
            toString: function () {
                return this.value;
            }
        };
    }

    function Watcher (vm, data, node) {
        this._init(vm, data, node);
    }

    Watcher.prototype._init = function (vm, data, node) {
        this.vm = vm;
        this.data = data;
        this.node = node;
        this.depended = false;
        this.tokenContent = node.textContent;
    };

    /**
     * 更新对应的 textNode 里的内容，改变视图
     */
    Watcher.prototype.update = function () {
        this.node.textContent = this.vm[this.data];
    };

    /**
     * 将 Dep.target 赋值为自身，再触发 data 对应的 getter
     * 从而使其调用 Dep.depend 来让 Dep 与当前 Watcher 绑定
     * 此时 Dep.notify 就可以通知到当前 Watcher
     */
    Watcher.prototype.bind = function () {
        debug(`开始绑定 ${this.data}`);
        Dep.target = this;
        this.vm[this.data];
        Dep.target = null;
    };

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
        this._watchers = [];
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
     * 解析 SDB.$el 及其 childNodes 中的 textNode；
     * 为每个有效的 token 设置一个 Watcher
     */
    SDB.prototype._compile = function () {
        compile(this, this.$el);
    };

    /**
     * 向 SDB._watchers 中添加一个 Watcher 对象；
     * data 指该 Watcher 对象观察的值对应 SDB.$data 中的属性名；
     * node 指一个具体的 textNode
     */
    SDB.prototype._addWatcher = function (data, node) {
        this._watchers.push(new Watcher(this, data, node));
    };

    /**
     * 用于判断一个对象是否为 SDB 的实例
     */
    SDB.prototype.toString = function () {
        return "[SDB instance]";
    };

    return SDB;

})));
