import debug from "./utils";

export default function Dep () {
    this._init();
}

Dep.target = null;

Dep.prototype._init = function () {
    this.subs = [];
}

Dep.prototype._addWatcher = function (w) {
    this.subs.push(w);
}

/**
 * 通知 this.subs 中的所有 Watcher 执行更新
 */
Dep.prototype.notify = function () {
    debug(`调用了 Dep.notify`);
    this.subs.forEach(function (w) {
        w.update();
    })
}

/**
 * 如果 Dep.target 尚未与某个 Dep 绑定，则与它建立绑定关系
 */
Dep.prototype.depend = function () {
    debug(`调用了 Dep.depend`);
    if (! Dep.target.depended) {
        this._addWatcher(Dep.target);
        Dep.target.depended = true;
    }
}