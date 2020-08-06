import debug, {copyArray, isTextNode} from "./utils";

export default function compile (vm, el) {
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
    })
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