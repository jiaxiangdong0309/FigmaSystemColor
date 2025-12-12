const fs = require('fs');
const path = require('path');

// 读取 ui.html 内容
const uiHtmlPath = path.join(__dirname, 'ui.html');
let uiHtml = fs.readFileSync(uiHtmlPath, 'utf8');

// 移除可能导致问题的特殊字符
// 移除 BOM
uiHtml = uiHtml.replace(/^\uFEFF/, '');
// 移除零宽字符
uiHtml = uiHtml.replace(/[\u200B-\u200D\uFEFF]/g, '');
// 移除其他不可见控制字符（保留换行和制表符）
uiHtml = uiHtml.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

// 读取编译后的 code.js
const codeJsPath = path.join(__dirname, 'code.js');
let codeJs = fs.readFileSync(codeJsPath, 'utf8');

// 使用 JSON.stringify 安全地转义 HTML
const escapedHtml = JSON.stringify(uiHtml);

// 替换 __html__ 为实际的 HTML 内容
codeJs = codeJs.replace(/__html__/g, escapedHtml);

// 写回 code.js
fs.writeFileSync(codeJsPath, codeJs, 'utf8');

console.log('Build complete: ui.html has been inlined into code.js');
console.log('HTML size:', uiHtml.length, 'bytes');
