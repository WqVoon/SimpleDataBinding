import debug from "./utils";

export default function compile (vm, el) {
    debug(`SDB: ${vm}, SDB.$el: ${el}`);
}

/**
 * parseText 函数切分字符串的正则
 */
var reg = /{{([^{}]+)}}/g;

/**
 * 将 str 根据 {{...}} 来拆分成多个 token 并返回
 * {{...}} 的 token 其 tag 属性为 true
 */
function parseText(str) {
    var result = null, tokens = [], preIndex = 0;
    debug(`开始解析 ${str}`);

    while (!! (result = reg.exec(str))) {
        if (result.index > preIndex)
            tokens.push(str.slice(preIndex, result.index));

        debug(` - ${result[1]} 是一个有效 token`);
        result[1].tag = true;
        tokens.push(result[1]);
        preIndex = reg.lastIndex;
    }
    preIndex === str.length || tokens.push(str.slice(preIndex));

    debug(`tokens(${tokens.length}): ${tokens.join('|')}`);
    return tokens;
}