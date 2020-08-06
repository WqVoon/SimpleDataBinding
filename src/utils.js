export default function debug (msg, showTrace=false) {
    config.debugMode && console.warn("[DEBUG]", msg);
    showTrace && console.trace();
}

export function isTextNode(el) {
    return el.nodeType === 3;
}

export function copyArray (preArray) {
    return Array.prototype.slice.call(preArray);
}

export var config = {
    debugMode: false
};