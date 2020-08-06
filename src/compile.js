import debug, {copyArray, isTextNode} from "./utils";

export default function compile (vm, el) {
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
    })
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

        debug(` - ${result[1]} 是一个有效 token`);
        result[1].isValidToken = true;
        tokens.push(result[1]);
        preIndex = reg.lastIndex;
        tokens.haveValidToken = true;
    }
    preIndex === str.length || tokens.push(str.slice(preIndex));

    debug(`tokens(${tokens.length}): ${tokens.join('|')}`);
    return tokens;
}