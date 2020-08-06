import Dep from "./dep";
import debug from "./utils";

export default function Watcher (vm, data, node) {
    this._init(vm, data, node);
}

Watcher.prototype._init = function (vm, data, node) {
    this.vm = vm;
    this.data = data;
    this.node = node;
    this.depended = false;
    this.tokenContent = node.textContent;
}

/**
 * 更新对应的 textNode 里的内容，改变视图
 */
Watcher.prototype.update = function () {
    this.node.textContent = this.vm[this.data];
}

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
}