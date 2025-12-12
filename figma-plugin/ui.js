"use strict";
// UI 线程代码 - 运行在 iframe 中
// 注意：暂时移除模块导入，等设置好构建工具后再添加
// 颜色服务将在后续步骤中通过构建工具打包后使用
// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('UI 脚本已加载');
    // 获取 DOM 元素
    const createBtn = document.getElementById('createBtn');
    const messageDiv = document.getElementById('message');
    if (!createBtn) {
        console.error('找不到 createBtn 元素');
        return;
    }
    if (!messageDiv) {
        console.error('找不到 messageDiv 元素');
        return;
    }
    console.log('DOM 元素已找到');
    // 显示消息
    function showMessage(text) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.classList.add('show');
            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, 2000);
        }
    }
    // 按钮点击事件
    createBtn.addEventListener('click', () => {
        console.log('按钮被点击');
        // 向主线程发送消息
        parent.postMessage({
            pluginMessage: {
                type: 'create-rectangle'
            }
        }, '*');
        console.log('消息已发送');
    });
    // 监听来自主线程的消息
    window.onmessage = (event) => {
        const msg = event.data.pluginMessage;
        if (msg.type === 'success') {
            showMessage(msg.message || '操作成功！');
        }
    };
    console.log('事件监听器已添加');
});
