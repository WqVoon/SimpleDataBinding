import debug from "./utils"
import Dep from "./dep";

/**
 * 对 data 中的每个 prop 调用 defineReactive
 */
export default function observe (data) {
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
    })
}