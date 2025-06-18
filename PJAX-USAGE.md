# APlayer 古腾堡区块 - PJAX 支持指南

本插件已经内置了对常见PJAX框架的支持，可以在使用PJAX技术的主题中正常工作。

## 自动支持的PJAX框架

插件会自动检测并支持以下PJAX框架：

- **jQuery PJAX** - 最常见的PJAX实现
- **Turbo/Turbolinks** - Rails默认的页面加速技术
- **Barba.js v2** - 现代的页面转换库
- **InstantClick** - 轻量级的页面加速库

## 手动集成（推荐）

如果你的主题使用了自定义的PJAX实现，或者想要更精确的控制，可以手动调用我们提供的API：

### 基本用法

```javascript
// 在页面离开前调用（停止播放器）
window.APlayerPJAX.onPageLeave();

// 在新页面加载完成后调用（初始化播放器）
window.APlayerPJAX.onPageEnter();
```

### 常见PJAX框架的手动集成示例

#### jQuery PJAX
```javascript
$(document).on('pjax:beforeSend', function() {
    window.APlayerPJAX.onPageLeave();
});

$(document).on('pjax:success', function() {
    window.APlayerPJAX.onPageEnter();
});
```

#### 自定义AJAX导航
```javascript
// 页面离开时
function onPageLeave() {
    window.APlayerPJAX.onPageLeave();
    // 其他清理工作...
}

// 页面加载完成时
function onPageLoad() {
    // DOM更新完成后...
    window.APlayerPJAX.onPageEnter();
}
```

#### Barba.js v2
```javascript
barba.hooks.before(() => {
    window.APlayerPJAX.onPageLeave();
});

barba.hooks.after(() => {
    window.APlayerPJAX.onPageEnter();
});
```

## 高级用法

### 指定容器初始化

如果你只想在特定容器中初始化播放器：

```javascript
// 使用选择器
window.APlayerPJAX.initInContainer('#main-content');

// 使用DOM元素
const container = document.getElementById('content');
window.APlayerPJAX.initInContainer(container);
```

### 指定容器清理

清理特定容器中的播放器：

```javascript
// 使用选择器
window.APlayerPJAX.destroyInContainer('#main-content');

// 使用DOM元素
const container = document.getElementById('content');
window.APlayerPJAX.destroyInContainer(container);
```

### 完整的PJAX集成示例

```javascript
// 假设你有一个自定义的PJAX实现
class MyPJAX {
    static init() {
        // 监听链接点击
        document.addEventListener('click', this.handleClick.bind(this));
    }
    
    static handleClick(e) {
        const link = e.target.closest('a');
        if (link && this.shouldIntercept(link)) {
            e.preventDefault();
            this.loadPage(link.href);
        }
    }
    
    static async loadPage(url) {
        // 1. 页面离开 - 清理播放器
        window.APlayerPJAX.onPageLeave();
        
        try {
            // 2. 加载新内容
            const response = await fetch(url);
            const html = await response.text();
            
            // 3. 更新页面内容
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            const newContent = newDoc.querySelector('#main-content');
            
            document.querySelector('#main-content').innerHTML = newContent.innerHTML;
            
            // 4. 页面加载完成 - 初始化播放器
            window.APlayerPJAX.onPageEnter();
            
        } catch (error) {
            console.error('PJAX navigation failed:', error);
            // 出错时回退到正常导航
            window.location.href = url;
        }
    }
}

// 初始化PJAX
MyPJAX.init();
```

## 可用的API方法

| 方法 | 描述 |
|------|------|
| `window.APlayerPJAX.onPageEnter()` | 页面进入时调用，初始化所有播放器 |
| `window.APlayerPJAX.onPageLeave()` | 页面离开时调用，清理所有播放器 |
| `window.APlayerPJAX.initInContainer(container)` | 初始化指定容器中的播放器 |
| `window.APlayerPJAX.destroyInContainer(container)` | 清理指定容器中的播放器 |
| `window.initAllAPlayerBlocks()` | 初始化页面上所有播放器（兼容方法） |
| `window.destroyAllAPlayerBlocks()` | 清理页面上所有播放器（兼容方法） |

## 故障排除

### 播放器重复初始化
如果发现播放器被重复初始化，请确保：
1. 只在页面完全加载完成后调用 `onPageEnter()`
2. 没有重复绑定PJAX事件监听器

### 播放器没有正确清理
如果切换页面时播放器仍在播放，请确保：
1. 在页面离开前调用了 `onPageLeave()`
2. PJAX的页面离开事件被正确触发

### 控制台错误
如果看到 "APlayer container not found" 错误：
1. 确保在DOM完全渲染后才初始化播放器
2. 可以增加延迟：`setTimeout(() => window.APlayerPJAX.onPageEnter(), 100)`

## 性能优化建议

1. **延迟初始化**：在PJAX导航完成后稍微延迟初始化播放器，确保DOM完全渲染
2. **容器级操作**：如果只有特定区域有播放器，使用 `initInContainer()` 而不是全局初始化
3. **事件清理**：确保在页面离开时正确清理播放器，防止内存泄漏

## 示例主题集成

如果你的主题开发者想要集成此插件，可以在主题的JavaScript文件中添加：

```javascript
// themes/your-theme/js/pjax-integration.js
jQuery(document).ready(function($) {
    // 如果使用jQuery PJAX
    if ($.fn.pjax) {
        $(document).on('pjax:beforeSend', function() {
            if (window.APlayerPJAX) {
                window.APlayerPJAX.onPageLeave();
            }
        });
        
        $(document).on('pjax:success', function() {
            if (window.APlayerPJAX) {
                window.APlayerPJAX.onPageEnter();
            }
        });
    }
});
```

通过以上配置，APlayer古腾堡区块就可以在PJAX主题中完美工作了！ 