# Figma Plugin - System Color Engine

基于工程级颜色系统的 Figma 插件，支持生成调色板、创建 Figma 变量和颜色样式。

## 快速开始

### 1. 在 Figma 中加载插件

1. 打开 Figma Desktop 应用
2. 进入任意文件
3. 菜单：`Plugins` → `Development` → `Import plugin from manifest...`
4. 选择 `figma-plugin/manifest.json` 文件
5. 插件会出现在 `Plugins` → `Development` → `System Color Engine`

### 2. 运行插件

1. 菜单：`Plugins` → `Development` → `System Color Engine`
2. 选择颜色系统（Tailwind、Material Design 3、Ant Design、Atlassian）
3. 设置基础颜色
4. 点击 Export 导出或创建 Figma 变量/样式

## 文件结构

```
figma-plugin/
├── manifest.json      # 插件配置文件
├── code.js            # 主线程代码（纯 JavaScript）
├── ui.html            # UI 界面（包含内联脚本）
├── package.json       # 依赖管理
└── README.md          # 说明文档
```

## 架构说明

采用 Figma 插件标准双线程架构（参考 cursor_mcp_plugin）：

### 主线程 (code.js)
- 运行在 Figma 沙箱环境
- 使用命令模式（switch-case）处理消息
- 支持的消息类型：
  - `notify` - 显示通知
  - `close-plugin` - 关闭插件
  - `create-variables` - 创建 Figma 变量
  - `create-styles` - 创建颜色样式
  - `update-settings` - 更新设置

### UI 线程 (ui.html)
- 运行在 iframe 中
- 包含完整的调色板生成器 UI
- 通过 `parent.postMessage` 与主线程通信

## 功能

- ✅ 支持多种颜色系统（Tailwind、Material Design 3、Ant Design、Atlassian）
- ✅ 调色板实时预览
- ✅ WCAG 对比度检测
- ✅ 自动修复对比度功能
- ✅ 创建 Figma 变量（Variables）
- ✅ 创建颜色样式（Paint Styles）
- ✅ 多种导出格式（CSS、SCSS、Tailwind、JSON、SVG 等）

## 调试

- **主线程调试**: `Plugins` → `Development` → `Open Console`
- **UI 调试**: 右键插件面板 → `Inspect Element`

## 开发注意事项

⚠️ **重要**: Figma 主线程有语法限制，禁止使用：
- 展开运算符 `...`（使用 `Object.assign` 替代）
- ES 模块 `import/export`
- TypeScript（直接使用纯 JavaScript）
- 可选链 `?.` 和空值合并 `??`

详见 `.cursor/rules/figma-plugin.md`
