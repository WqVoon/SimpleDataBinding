export default function debug (msg) {
    config.debugMode && console.warn("[DEBUG]", msg);
}

export var config = {
    debugMode: true
};