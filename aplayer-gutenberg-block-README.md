# APlayer 古腾堡区块

一个基于 [APlayer](https://github.com/DIYgod/APlayer) 的WordPress古腾堡区块插件，让你可以在文章和页面中轻松添加音乐播放器。

## 功能特性

- ✅ 完整的古腾堡区块支持
- ✅ 支持WordPress媒体库文件
- ✅ 支持多音轨播放列表
- ✅ 可自定义主题颜色
- ✅ 支持歌词显示
- ✅ 响应式设计
- ✅ 多种播放模式（顺序、循环、随机）
- ✅ **PJAX主题支持** - 自动适配无刷新页面切换

## 安装方法

1. 将插件文件夹上传到 `/wp-content/plugins/` 目录
2. 在WordPress管理后台激活插件
3. 在古腾堡编辑器中搜索"音乐播放器"区块

## 使用方法

1. 在古腾堡编辑器中添加"音乐播放器"区块
2. 从WordPress媒体库选择音频文件
3. 配置播放器设置（主题色、播放模式等）
4. 发布文章

## PJAX主题支持

本插件内置了对PJAX主题的完整支持，可以在使用无刷新页面切换技术的主题中正常工作。

### 自动支持的框架
- jQuery PJAX
- Turbo/Turbolinks  
- Barba.js v2
- InstantClick

### 手动集成
如果你的主题使用自定义的PJAX实现，可以使用以下API：

```javascript
// 页面离开时停止播放器
window.APlayerPJAX.onPageLeave();

// 页面加载完成时初始化播放器  
window.APlayerPJAX.onPageEnter();
```

### 高级用法
```javascript
// 仅在指定容器中初始化播放器
window.APlayerPJAX.initInContainer('#main-content');

// 仅清理指定容器中的播放器
window.APlayerPJAX.destroyInContainer('#main-content');
```

📖 **详细的PJAX使用指南请查看：[PJAX-USAGE.md](./PJAX-USAGE.md)**

## 配置选项

- **主题颜色**：自定义播放器主题色
- **播放模式**：列表播放、列表循环、单曲循环、随机播放
- **预加载**：音频预加载策略
- **音量**：默认音量大小
- **列表折叠**：是否默认折叠播放列表
- **自动播放**：是否自动开始播放（需浏览器支持）
- **显示歌词**：是否显示歌词功能

## 故障排除

### PJAX相关问题

**播放器重复初始化**
- 确保只在页面完全加载后调用 `onPageEnter()`
- 避免重复绑定PJAX事件监听器

**播放器没有正确清理**
- 确保在页面离开前调用 `onPageLeave()`
- 检查PJAX的页面离开事件是否正确触发

**控制台错误**
- 如果看到 "APlayer container not found" 错误，可以增加延迟初始化：
```javascript
setTimeout(() => window.APlayerPJAX.onPageEnter(), 100)
```

## 可用的JavaScript API

| API方法 | 描述 |
|---------|------|
| `window.APlayerPJAX.onPageEnter()` | 页面进入时初始化所有播放器 |
| `window.APlayerPJAX.onPageLeave()` | 页面离开时清理所有播放器 |
| `window.APlayerPJAX.initInContainer(container)` | 初始化指定容器中的播放器 |
| `window.APlayerPJAX.destroyInContainer(container)` | 清理指定容器中的播放器 |
| `window.initAllAPlayerBlocks()` | 兼容方法：初始化所有播放器 |
| `window.destroyAllAPlayerBlocks()` | 兼容方法：清理所有播放器 |

## 许可证

MIT License

## 版本历史

### v1.0.3
- ✅ 添加了完整的PJAX支持
- ✅ 自动检测常见PJAX框架（jQuery PJAX、Turbo/Turbolinks、Barba.js v2、InstantClick）
- ✅ 提供手动集成API
- ✅ 添加容器级别的播放器管理
- ✅ 增强的页面切换处理机制

### v1.0.2
- ✅ 修复了WordPress古腾堡区块的兼容性问题
- ✅ 优化了播放器初始化逻辑 