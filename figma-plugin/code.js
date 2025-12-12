// 主线程代码 - 运行在 Figma 沙箱环境中
// 架构参考: cursor_mcp_plugin

// 插件状态
const state = {
  settings: {}
};

// 显示插件 UI
figma.showUI(__html__, {
  width: 1200,
  height: 800,
  title: "System Color Engine"
});

// 监听来自 UI 的消息 - 使用命令模式
figma.ui.onmessage = async (msg) => {
  console.log('收到消息:', msg);

  switch (msg.type) {
    case 'notify':
      figma.notify(msg.message);
      break;

    case 'close-plugin':
      figma.closePlugin();
      break;

    case 'create-variables':
      await handleCreateVariables(msg);
      break;

    case 'create-styles':
      await handleCreateStyles(msg);
      break;

    case 'update-settings':
      updateSettings(msg);
      break;

    default:
      console.warn('未知消息类型:', msg.type);
  }
};

// 更新设置
function updateSettings(settings) {
  if (settings) {
    state.settings = Object.assign({}, state.settings, settings);
    figma.clientStorage.setAsync('settings', state.settings);
  }
}

// HEX 转 RGB (0-1 范围) - 用于 Figma 变量
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

// 处理创建变量
async function handleCreateVariables(msg) {
  try {
    const { palette, prefix } = msg;

    if (!palette || palette.length === 0) {
      figma.notify('调色板为空', { error: true });
      figma.ui.postMessage({
        type: 'error',
        message: '调色板为空'
      });
      return;
    }

    // 创建变量集合
    const collectionName = prefix
      ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Scale`
      : 'Color Scale';

    let collection;

    try {
      collection = figma.variables.createVariableCollection(collectionName);
    } catch (error) {
      // 如果集合已存在，尝试查找现有集合
      const existingCollections = figma.variables.getLocalVariableCollections();
      const existing = existingCollections.find(c => c.name === collectionName);
      if (existing) {
        collection = existing;
        figma.notify(`使用现有变量集合: ${collectionName}`);
      } else {
        throw error;
      }
    }

    const modeId = collection.modes[0].modeId;
    let createdCount = 0;
    let skippedCount = 0;

    // 为每个调色板步骤创建变量
    for (const item of palette) {
      const variableName = `${prefix}/${item.step}`;
      const rgb = hexToRgb(item.hex);

      if (!rgb) {
        console.warn(`无法解析颜色: ${item.hex}`);
        skippedCount++;
        continue;
      }

      try {
        // 检查变量是否已存在
        const existingVars = figma.variables.getLocalVariables();
        const existing = existingVars.find(v =>
          v.name === variableName && v.variableCollectionId === collection.id
        );

        if (existing) {
          // 更新现有变量的值
          existing.setValueForMode(modeId, rgb);
          skippedCount++;
        } else {
          // 创建新变量
          const variable = figma.variables.createVariable(variableName, collection.id, 'COLOR');
          variable.setValueForMode(modeId, rgb);
          createdCount++;
        }
      } catch (error) {
        console.error(`创建变量失败 ${variableName}:`, error);
        skippedCount++;
      }
    }

    const message = createdCount > 0
      ? `已创建 ${createdCount} 个变量${skippedCount > 0 ? `，跳过 ${skippedCount} 个` : ''}`
      : `所有变量已存在（${skippedCount} 个）`;

    figma.notify(message);

    figma.ui.postMessage({
      type: 'variables-created',
      count: createdCount,
      skipped: skippedCount
    });

  } catch (error) {
    console.error('创建变量失败:', error);
    figma.notify(`创建变量失败: ${error.message}`, { error: true });

    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// 处理创建样式
async function handleCreateStyles(msg) {
  try {
    const { palette, prefix } = msg;

    if (!palette || palette.length === 0) {
      figma.notify('调色板为空', { error: true });
      figma.ui.postMessage({
        type: 'error',
        message: '调色板为空'
      });
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    // 为每个调色板步骤创建颜色样式
    for (const item of palette) {
      const styleName = `${prefix}/${item.step}`;
      const rgb = hexToRgb(item.hex);

      if (!rgb) {
        console.warn(`无法解析颜色: ${item.hex}`);
        skippedCount++;
        continue;
      }

      try {
        // 检查样式是否已存在
        const existingStyles = figma.getLocalPaintStyles();
        const existing = existingStyles.find(s => s.name === styleName);

        if (existing) {
          // 更新现有样式
          existing.paints = [{
            type: 'SOLID',
            color: rgb
          }];
          skippedCount++;
        } else {
          // 创建新样式
          const style = figma.createPaintStyle();
          style.name = styleName;
          style.paints = [{
            type: 'SOLID',
            color: rgb
          }];
          createdCount++;
        }
      } catch (error) {
        console.error(`创建样式失败 ${styleName}:`, error);
        skippedCount++;
      }
    }

    const message = createdCount > 0
      ? `已创建 ${createdCount} 个颜色样式${skippedCount > 0 ? `，跳过 ${skippedCount} 个` : ''}`
      : `所有样式已存在（${skippedCount} 个）`;

    figma.notify(message);

    figma.ui.postMessage({
      type: 'styles-created',
      count: createdCount,
      skipped: skippedCount
    });

  } catch (error) {
    console.error('创建样式失败:', error);
    figma.notify(`创建样式失败: ${error.message}`, { error: true });

    figma.ui.postMessage({
      type: 'error',
      message: error.message
    });
  }
}

// 初始化插件设置
(async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync('settings');
    if (savedSettings) {
      state.settings = savedSettings;
    }

    // 发送初始设置到 UI
    figma.ui.postMessage({
      type: 'init-settings',
      settings: state.settings
    });
  } catch (error) {
    console.error('加载设置失败:', error);
  }
})();
