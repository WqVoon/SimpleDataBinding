import observe from "./observe"
import {config} from "./utils"
import compile from "./compile";
import Watcher from "./watcher";

export default function SDB (options) {
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
}

/**
 * 将 SDB.$data 中的 prop 设置为 accessor
 */
SDB.prototype._observe = function () {
    observe(this.$data);
}

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
        })
    })
}

/**
 * 解析 SDB.$el 及其 childNodes 中的 textNode
 * 为每个有效的 token 设置一个 Watcher
 */
SDB.prototype._compile = function () {
    compile(this, this.$el);
}

/**
 * 向 SDB._watchers 中添加一个 Watcher 对象
 * data 指该 Watcher 对象观察的值对应 SDB.$data 中的属性名
 * node 指一个具体的 textNode
 */
SDB.prototype._addWatcher = function (data, node) {
    this._watchers.push(new Watcher(this, data, node));
}

/**
 * 用于判断一个对象是否为 SDB 的实例
 */
SDB.prototype.toString = function () {
    return "[SDB instance]";
}