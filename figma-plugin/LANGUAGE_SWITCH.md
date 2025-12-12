# 中英文切换功能说明

## 实现方案

采用最简单直接的方案：
1. 定义全局语言包对象 `LANG_PACK`，包含中英文所有文本
2. 使用全局变量 `T` 指向当前语言包
3. 切换语言时，只需替换 `T` 的引用，然后刷新界面

## 功能位置

语言切换开关位于页面右上角，在 "Auto-fix Contrast" 开关之前。

## 使用方法

1. 在 Figma 中打开插件
2. 点击右上角的语言切换开关
3. 默认为英文（EN），点击后切换为中文（中文）
4. 再次点击切换回英文

## 翻译范围

✅ **已翻译的内容**：
- 侧边栏标签（颜色系统、基础颜色、Token 配置等）
- 按钮文本（随机、导出、复制等）
- 主内容区标题和统计信息
- 导出模态框标题和按钮
- 所有提示消息
- 颜色系统描述文本

❌ **保持英文的内容**：
- 专有名词（Tailwind CSS、Material Design 3、Ant Design 等）
- 技术术语（WCAG、RGB、HEX 等）
- 代码相关内容

## 技术细节

### 语言包结构
```javascript
const LANG_PACK = {
  en: { /* 英文文本 */ },
  zh: { /* 中文文本 */ }
};

let T = LANG_PACK.en; // 当前使用的语言
```

### 切换逻辑
```javascript
function switchLanguage(lang) {
  currentLang = lang;
  T = LANG_PACK[lang];  // 替换对象引用
  updateStaticLabels(); // 更新静态标签
  renderPalette();      // 重新渲染动态内容
}
```

### 使用方式
在代码中直接使用 `T.xxx` 引用文本：
```javascript
showMessage(T.randomColorGenerated);
document.getElementById('exportBtnText').textContent = T.export;
```

## 优势

1. **极简实现**：只需替换一个对象引用
2. **易于维护**：所有文本集中在 `LANG_PACK` 中
3. **性能优秀**：切换语言是 O(1) 操作
4. **扩展方便**：添加新语言只需在 `LANG_PACK` 中添加新的语言包

## 测试建议

1. 测试语言切换功能是否正常
2. 检查所有界面文本是否正确翻译
3. 验证切换语言后动态生成的内容（如调色板卡片）是否使用新语言
4. 确认提示消息使用正确的语言

