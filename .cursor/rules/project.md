# System Color Engine - 项目说明

## ⚠️ 第一原则（CRITICAL）

**永远不要修改当前项目的任何现有代码和文件！**

- **禁止修改**: `App.tsx`、`components/`、`services/`、`types.ts`、`constants.ts` 等所有现有文件
- **Figma 插件开发**: 所有 Figma 插件相关代码必须放在独立的文件夹中（如 `figma-plugin/`）
- **代码隔离**: Figma 插件代码与现有项目代码完全隔离，如需复用逻辑，通过引用或复制的方式，而不是直接修改原文件
- **唯一修改区域**: 只能修改 `figma-plugin/` 文件夹内的代码

## 项目概述
这是一个基于 React + TypeScript + Vite 的颜色系统生成工具，用于生成工程级的颜色调色板。

## 技术栈
- **框架**: React 19.2.1
- **语言**: TypeScript 5.8.2
- **构建工具**: Vite 6.2.0
- **样式**: Tailwind CSS（内联类名）
- **颜色计算**: d3 7.9.0

## 项目结构

### 现有项目（禁止修改）
- `App.tsx` - 主应用组件，包含状态管理和布局
- `components/` - 可复用组件（Button, PaletteItem, ExportModal, Toggle）
- `services/colorService.ts` - 颜色生成和 WCAG 对比度计算逻辑
- `types.ts` - TypeScript 类型定义
- `constants.ts` - 常量配置（颜色模式、图标等）

### Figma 插件（独立文件夹）
- `figma-plugin/` - Figma 插件代码目录（所有插件相关代码都在此文件夹内）

## 核心功能
1. **颜色系统生成**: 支持多种颜色系统（Tailwind, Material Design, Ant Design 等）
2. **WCAG 对比度检查**: 自动计算并显示对比度等级
3. **颜色锁定**: 可以锁定特定步骤的颜色
4. **自动修复**: 可启用自动修复对比度功能
5. **导出功能**: 支持导出为多种格式（CSS, JSON, Figma Tokens 等）

## 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS 类名
- 组件文件使用 PascalCase 命名
- 工具函数放在 `services/` 目录

## 重要约定
- 颜色值统一使用大写 HEX 格式（如 `#3B82F6`）
- 状态管理使用 React useState/useEffect
- 颜色计算逻辑集中在 `colorService.ts`
- 组件保持单一职责原则

## 开发注意事项

### Figma 插件开发
- **严格隔离**: Figma 插件代码必须完全独立，放在 `figma-plugin/` 文件夹中
- **代码复用**: 如需复用现有逻辑，可以通过 import 引用或复制代码到插件文件夹，但绝不修改原文件
- **插件结构**: Figma 插件需要独立的 `manifest.json`、UI 代码和插件逻辑代码

### 现有项目维护
- 修改颜色生成算法时，注意保持 WCAG 对比度计算的准确性
- 新增颜色系统模式时，需要在 `constants.ts` 的 `COLOR_MODES` 中添加配置
- 导出功能在 `ExportModal` 组件中实现，支持多种格式
- UI 使用 Tailwind CSS，保持设计系统的一致性

