# Figma 插件开发规则

## ⚠️ 核心原则（CRITICAL）

**所有 Figma 插件代码必须放在 `figma-plugin/` 文件夹中，绝对禁止修改现有项目代码！**

## Figma 插件技术规范

### 1. 开发语言和工具

- **TypeScript**: Figma 官方推荐使用 TypeScript 开发插件，提供完整的类型支持
- **JavaScript**: 也可以直接使用纯 JavaScript（推荐用于快速原型）
- **官方脚手架**: 可以使用 `create-figma-plugin` 或手动创建
- **构建工具**: 可以使用 Webpack、Vite 或其他构建工具（但需要适配 Figma 插件环境）

#### ⚠️ 重要：模块系统限制

- **主线程（code.js）**: **不支持 ES 模块**（`import/export`），只能使用纯 JavaScript
- **UI 线程**: 虽然理论上支持 ES 模块，但需要构建工具打包，否则浏览器无法解析相对路径
- **推荐方案**: 使用纯 JavaScript，将 UI 代码直接内联到 HTML 的 `<script>` 标签中

### 2. Figma 插件架构

Figma 插件采用**双线程架构**：

#### 2.1 主线程（Plugin Code）
- **文件**: `code.ts` 或 `code.js`
- **运行环境**: Figma 主线程（Sandbox 环境）
- **功能**:
  - 访问 Figma API（创建/修改节点、读取文档等）
  - 处理插件核心逻辑
  - 与 UI 线程通信（通过 `postMessage`）
- **限制**:
  - **不支持 ES 模块**（`import/export`），只能使用纯 JavaScript
  - 不能使用 DOM API（`document`, `window` 等）
  - 不能使用 Node.js API
  - 只能使用 Figma API 和标准 JavaScript/TypeScript
  - 如果使用 TypeScript，编译后必须是纯 JavaScript，不能包含模块导入

#### 2.2 UI 线程（Plugin UI）
- **文件**: `ui.html` + `ui.ts` 或 `ui.js`
- **运行环境**: iframe 中运行（类似普通网页）
- **功能**:
  - 渲染用户界面
  - 处理用户交互
  - 与主线程通信（通过 `parent.postMessage`）
- **限制**:
  - 不能直接访问 Figma API
  - 需要通过 `postMessage` 与主线程通信
- **模块加载**:
  - 虽然支持 ES 模块，但需要构建工具打包，否则浏览器无法解析相对路径
  - **推荐**: 将 UI 代码直接内联到 HTML 的 `<script>` 标签中，避免模块加载问题

### 3. 必需文件结构

```
figma-plugin/
├── manifest.json          # 插件配置文件（必需）
├── code.ts               # 主线程代码（必需）
├── ui.html               # UI HTML 文件（可选，但通常需要）
├── ui.ts                 # UI TypeScript 代码（可选）
├── package.json          # 依赖管理（推荐）
└── tsconfig.json         # TypeScript 配置（推荐）
```

### 4. manifest.json 规范

```json
{
  "name": "插件名称",
  "id": "插件ID（可选）",
  "api": "1.0.0",
  "main": "code.js",           // 主线程入口
  "ui": "ui.html",             // UI 入口（可选）
  "editorType": ["figma"],     // 支持 Figma 或 FigJam
  "networkAccess": {
    "allowedDomains": []       // 允许的网络访问（可选）
  }
}
```

### 5. 通信机制

#### 主线程 → UI 线程
```typescript
// code.ts
figma.ui.postMessage({ type: 'message-type', data: {...} });
```

#### UI 线程 → 主线程
```typescript
// ui.ts
parent.postMessage({ type: 'message-type', data: {...} }, '*');
```

#### 消息监听
```typescript
// code.ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'action') {
    // 处理消息
  }
};

// ui.ts
window.onmessage = (event) => {
  if (event.data.pluginMessage.type === 'update') {
    // 处理消息
  }
};
```

### 6. Figma API 常用功能

#### 6.1 创建节点
```typescript
// 创建矩形
const rect = figma.createRectangle();
rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
figma.currentPage.appendChild(rect);
```

#### 6.2 创建颜色样式
```typescript
const paint: SolidPaint = {
  type: 'SOLID',
  color: { r: 0.2, g: 0.5, b: 1 }
};
const style = figma.createPaintStyle();
style.name = 'Primary/500';
style.paints = [paint];
```

#### 6.3 读取选中节点
```typescript
const selection = figma.currentPage.selection;
if (selection.length > 0) {
  const node = selection[0];
  // 处理节点
}
```

### 7. 颜色系统集成

#### 7.1 复用现有逻辑
- **方式1**: 复制 `services/colorService.ts` 到 `figma-plugin/src/services/`
- **方式2**: 通过构建工具共享代码（需要配置）
- **方式3**: 将核心逻辑提取为独立模块

#### 7.2 颜色格式转换
- Figma 使用 RGB 格式（0-1 范围）
- 需要将 HEX 转换为 RGB: `{ r: 0.23, g: 0.51, b: 0.96 }`
- 转换函数需要放在插件代码中

### 8. UI 实现建议

#### 8.1 不使用 React（推荐）
- Figma 插件 UI 通常较小，原生 HTML/CSS/JS 足够
- 减少打包体积和复杂度
- 更好的性能

#### 8.2 使用 React（如果必须）
- 需要配置构建工具（Webpack/Vite）
- 需要处理 Figma UI 的特殊样式
- 注意打包后的文件大小限制

#### 8.3 UI 代码内联（推荐方式）
- **最佳实践**: 将 UI JavaScript 代码直接内联到 `ui.html` 的 `<script>` 标签中
- **原因**: 避免模块加载问题，无需构建工具打包
- **示例**:
  ```html
  <script>
    // UI 代码直接写在这里
    document.addEventListener('DOMContentLoaded', function() {
      // 初始化代码
    });
  </script>
  ```
- **构建脚本**: 使用 `build.js` 将 HTML 内容内联到 `code.js` 中（使用 `__html__` 占位符）

#### 8.4 样式规范
- 使用 Figma 设计规范的颜色和间距
- 参考 Figma 官方插件的 UI 风格
- 确保 UI 在插件面板中正常显示

### 9. 开发流程

#### 9.1 基础设置
1. **创建插件文件夹**: `figma-plugin/`
2. **初始化项目**: 创建 `manifest.json`、`code.js`（或 `code.ts`）、`ui.html`
3. **安装依赖**:
   ```bash
   cd figma-plugin
   npm install @figma/plugin-typings --save-dev
   ```

#### 9.2 推荐开发方式（纯 JavaScript）
1. **创建 `code.js`**: 使用纯 JavaScript，避免模块导入
2. **创建 `ui.html`**: 将 UI JavaScript 代码直接内联到 `<script>` 标签中
3. **创建 `build.js`**: 构建脚本，将 HTML 内容内联到 `code.js` 中
   ```javascript
   // build.js 示例
   const fs = require('fs');
   const htmlContent = fs.readFileSync('ui.html', 'utf-8');
   let codeJs = fs.readFileSync('code.js', 'utf-8');
   // 转义并替换 __html__ 占位符
   codeJs = codeJs.replace(/__html__/g, `\`${htmlContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\``);
   fs.writeFileSync('code.js', codeJs);
   ```
4. **开发**: 在 `figma-plugin/` 文件夹内开发
5. **构建**: 运行 `node build.js` 将 HTML 内联
6. **测试**: 在 Figma 中加载插件进行测试

#### 9.3 使用 TypeScript（可选）
- 如果使用 TypeScript，编译后必须确保：
  - `code.js` 不包含任何 `import/export` 语句
  - UI 代码内联在 HTML 中，不通过外部文件引用
  - 需要构建脚本处理 HTML 内联

### 10. 调试方法

- **主线程调试**: Figma → Plugins → Development → Open Console
- **UI 线程调试**: 右键插件 UI → Inspect Element（浏览器开发者工具）
- **日志输出**: 使用 `console.log()`，在主线程控制台查看

### 11. 注意事项

- **模块系统**: 主线程不支持 ES 模块，必须使用纯 JavaScript
- **UI 代码**: 推荐内联到 HTML 中，避免模块加载问题
- **文件大小**: 插件代码有大小限制，注意优化
- **权限**: 某些 API 需要用户授权（如网络访问）
- **性能**: 避免在主线程执行耗时操作
- **错误处理**: 必须处理所有可能的错误情况
- **调试**: 添加 `console.log` 帮助调试，主线程日志在 Figma 控制台，UI 日志在浏览器控制台

### 11.1 ⚠️ Figma 主线程 JavaScript 语法限制（CRITICAL）

Figma 插件主线程（code.js）运行在受限的沙箱环境中，**不支持部分现代 JavaScript 语法**：

#### 禁止使用的语法：
- ❌ **展开运算符 `...`**: `{ ...obj }` 或 `[...arr]` 会报错 `Unexpected token ...`
- ❌ **ES 模块**: `import/export` 语句
- ❌ **TypeScript**: 主线程必须是纯 JavaScript，不能使用 `.ts` 文件
- ❌ **可选链 `?.`**: `obj?.prop` 可能不支持
- ❌ **空值合并 `??`**: `a ?? b` 可能不支持

#### 替代方案：
```javascript
// ❌ 错误：使用展开运算符
state.settings = { ...state.settings, ...newSettings };

// ✅ 正确：使用 Object.assign
state.settings = Object.assign({}, state.settings, newSettings);

// ❌ 错误：数组展开
const newArr = [...arr1, ...arr2];

// ✅ 正确：使用 concat
const newArr = arr1.concat(arr2);

// ❌ 错误：使用可选链
const value = obj?.nested?.prop;

// ✅ 正确：使用条件判断
const value = obj && obj.nested && obj.nested.prop;

// ❌ 错误：使用空值合并
const value = input ?? defaultValue;

// ✅ 正确：使用三元运算符
const value = input !== null && input !== undefined ? input : defaultValue;
```

#### 开发建议：
1. **直接使用 JavaScript**: 不要使用 TypeScript，避免编译问题
2. **使用 ES5/ES6 基础语法**: 坚持使用经典的 JavaScript 语法
3. **测试**: 每次修改后在 Figma 中测试，确保语法兼容

### 12. 代码复用策略

#### 策略1: 复制代码（推荐）
- 将需要的代码复制到 `figma-plugin/src/` 目录
- 保持代码独立，不依赖原项目

#### 策略2: 共享模块
- 创建共享的 `shared/` 目录
- 通过构建工具配置共享代码
- 需要确保兼容性

#### 策略3: 提取核心逻辑
- 将核心算法提取为独立包
- 插件和主项目都依赖这个包
- 需要额外的包管理

### 13. 禁止事项

- ❌ 直接修改原项目的任何文件
- ❌ 在原项目中添加 Figma 插件相关代码
- ❌ 使用原项目的构建配置
- ❌ 依赖原项目的运行时环境
- ❌ 在主线程（code.js）中使用 ES 模块（`import/export`）
- ❌ 在 UI 线程中使用外部模块文件而不打包（会导致浏览器无法解析）
- ❌ **在主线程使用 TypeScript**（直接使用 JavaScript）
- ❌ **在主线程使用展开运算符 `...`**（使用 `Object.assign` 替代）
- ❌ **在主线程使用可选链 `?.` 或空值合并 `??`**
- ✅ 只能修改 `figma-plugin/` 文件夹内的代码
- ✅ 使用纯 JavaScript（ES5/ES6 基础语法）
- ✅ 将 UI 代码内联到 HTML 中
- ✅ 使用 `Object.assign` 合并对象
- ✅ 使用 `concat` 合并数组

### 14. 实践经验总结

#### 14.1 常见问题
1. **问题**: 使用 TypeScript 编译后，`code.js` 包含 `import` 语句
   - **解决**: 主线程必须使用纯 JavaScript，不能有模块导入

2. **问题**: UI 代码通过 `<script src="ui.js">` 引用，但无法加载
   - **解决**: 将 UI 代码直接内联到 HTML 的 `<script>` 标签中

3. **问题**: 浏览器控制台报错 "Failed to load module"
   - **解决**: UI 线程虽然支持 ES 模块，但需要构建工具打包，推荐内联代码

#### 14.2 推荐的项目结构
```
figma-plugin/
├── manifest.json          # 插件配置
├── code.js               # 主线程代码（纯 JavaScript）
├── ui.html               # UI HTML（包含内联的 JavaScript）
├── build.js              # 构建脚本（将 HTML 内联到 code.js）
├── package.json          # 依赖管理
└── src/                  # 源代码目录（可选，用于代码复用）
    ├── services/         # 服务层代码
    └── constants.ts      # 常量定义
```

#### 14.3 构建脚本示例
```javascript
// build.js
const fs = require('fs');
const path = require('path');

// 读取 HTML 文件
const htmlPath = path.join(__dirname, 'ui.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// 读取 code.js
const codeJsPath = path.join(__dirname, 'code.js');
let codeJsContent = fs.readFileSync(codeJsPath, 'utf-8');

// 转义 HTML 内容
const escapedHtml = htmlContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\${/g, '\\${')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r');

// 替换 __html__ 占位符
codeJsContent = codeJsContent.replace(
  /__html__/g,
  `\`${escapedHtml}\``
);

// 写回文件
fs.writeFileSync(codeJsPath, codeJsContent, 'utf-8');
console.log('✓ HTML 内容已内联到 code.js');
```

