# 🎵 APlayer 古腾堡区块

<p align="center">
  <img src="https://ws4.sinaimg.cn/large/006tKfTcgy1fhu01y9uy7j305k04s3yc.jpg" alt="APlayer" width="100">
</p>

<p align="center">
  <strong>一个优雅的WordPress古腾堡音乐播放器区块插件</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#安装方法">安装</a> •
  <a href="#使用指南">使用</a> •
  <a href="#pjax支持">PJAX支持</a> •
  <a href="#故障排除">故障排除</a>
</p>

---

## 📖 简介

基于强大的 [APlayer](https://github.com/DIYgod/APlayer) 音乐播放器开发的WordPress古腾堡区块插件。让你可以在文章和页面中轻松添加美观、功能丰富的音乐播放器，支持本地文件、WordPress媒体库以及网易云音乐。

## ✨ 功能特性

- 🎨 **现代化界面** - 美观的播放器界面，完美适配各种主题
- 📱 **响应式设计** - 在各种设备上都有出色的显示效果
- 🎵 **多音轨支持** - 支持播放列表，可添加多首歌曲
- 📚 **媒体库集成** - 直接从WordPress媒体库选择音频文件
- 🌐 **网易云音乐支持** - 支持网易云音乐歌曲和歌单播放
- 🔗 **链接自动解析** - 自动解析网易云音乐分享链接
- 🎨 **自定义主题** - 可自定义播放器主题颜色
- 📝 **歌词支持** - 支持LRC格式歌词显示
- 🔄 **多种播放模式** - 顺序播放、循环播放、随机播放
- ⚡ **PJAX完全支持** - 在无刷新页面切换主题中完美工作
- 🛠️ **易于使用** - 所见即所得的古腾堡区块编辑器
- 📦 **无外部依赖** - 不依赖CDN，所有资源本地化

## 🚀 安装方法

### 方法一：手动安装
1. 下载插件文件
2. 将插件文件夹上传到 `/wp-content/plugins/` 目录
3. 在WordPress管理后台的"插件"页面激活插件

### 方法二：通过WordPress后台安装
1. 登录WordPress管理后台
2. 进入"插件" → "安装插件"
3. 搜索"APlayer古腾堡区块"
4. 点击"安装"并激活

## 📝 使用指南

### 基本使用

1. **添加区块**
   - 在古腾堡编辑器中点击"+"添加区块
   - 搜索"音乐播放器"或"APlayer"
   - 选择"音乐播放器"区块

2. **选择音乐来源**
   - **本地文件**: 从WordPress媒体库选择音频文件
   - **网易云音乐**: 通过歌曲/歌单ID或分享链接播放

3. **配置音乐内容**
   - **本地模式**: 点击"添加音轨"按钮，从媒体库选择文件
   - **网易云模式**: 粘贴分享链接或输入歌曲/歌单ID

4. **配置播放器**
   - 在右侧面板调整播放器设置
   - 选择主题颜色、播放模式等

5. **发布内容**
   - 预览效果，确认无误后发布

### 网易云音乐使用方法

🎵 **详细的网易云音乐使用指南：[NETEASE-USAGE.md](./NETEASE-USAGE.md)**
🔧 **API配置说明：[API-SETUP.md](./API-SETUP.md)**

**快速开始：**
1. 选择音乐来源为"网易云音乐"
2. 粘贴网易云音乐分享链接（推荐）
3. 或手动输入歌曲/歌单ID
4. 调整播放器设置并发布

**关于API：**
- ✅ 已内置稳定的Meting API，无需额外配置
- ✅ 支持自定义API服务器
- ✅ 在"设置"→"APlayer设置"中可配置API地址

### 配置选项详解

| 选项 | 描述 | 默认值 |
|------|------|--------|
| **主题颜色** | 播放器的主题色彩 | #b7daff |
| **播放模式** | 列表播放/列表循环/单曲循环/随机播放 | 列表循环 |
| **预加载** | 音频预加载策略：自动/元数据/无 | 自动 |
| **默认音量** | 播放器初始音量 (0-1) | 0.7 |
| **列表折叠** | 是否默认折叠播放列表 | 否 |
| **列表最大高度** | 播放列表的最大显示高度 | 340px |
| **自动播放** | 是否自动开始播放（需浏览器支持） | 否 |
| **显示歌词** | 是否启用歌词功能 | 否 |

### 音轨配置

每个音轨可以设置：
- **音频文件** - 来自媒体库或外部URL
- **歌曲标题** - 显示的歌曲名称
- **艺术家** - 歌手或乐队名称  
- **专辑封面** - 歌曲封面图片
- **歌词文件** - LRC格式的歌词文件

## 🔄 PJAX支持

本插件完全支持PJAX技术，可以在使用无刷新页面切换的主题中正常工作。

### 自动支持的框架

- ✅ **jQuery PJAX** - 最常见的PJAX实现
- ✅ **Turbo/Turbolinks** - Rails风格的页面加速
- ✅ **Barba.js v2** - 现代页面转换库
- ✅ **InstantClick** - 轻量级页面加速

### 手动集成

如果你的主题使用自定义PJAX实现，可以使用以下API：

#### 使用jQuery的主题
```javascript
// 页面离开时
$(document).on('pjax:send', function() {
    if (window.APlayerPJAX) {
        window.APlayerPJAX.onPageLeave();
    }
});

// 页面加载完成时
$(document).on('pjax:complete', function() {
    if (window.APlayerPJAX) {
        window.APlayerPJAX.onPageEnter();
    }
});
```

#### 不使用jQuery的主题
```javascript
// 页面离开时
document.addEventListener('pjax:send', function() {
    if (window.APlayerPJAX) {
        window.APlayerPJAX.onPageLeave();
    }
});

// 页面加载完成时
document.addEventListener('pjax:complete', function() {
    if (window.APlayerPJAX) {
        window.APlayerPJAX.onPageEnter();
    }
});
```

### 可用API

| API方法 | 描述 |
|---------|------|
| `window.APlayerPJAX.onPageEnter()` | 页面进入时初始化所有播放器 |
| `window.APlayerPJAX.onPageLeave()` | 页面离开时清理所有播放器 |
| `window.APlayerPJAX.initInContainer(container)` | 初始化指定容器中的播放器 |
| `window.APlayerPJAX.destroyInContainer(container)` | 清理指定容器中的播放器 |

📖 **详细的PJAX集成指南：[PJAX-USAGE.md](./PJAX-USAGE.md)**

## 🔧 故障排除

### 常见问题

#### 播放器不显示
1. 检查是否已添加音频文件
2. 确认音频文件格式是否支持（MP3、WAV、OGG等）
3. 检查浏览器控制台是否有错误信息

#### PJAX相关问题

**播放器重复初始化**
- 确保不要重复绑定PJAX事件监听器
- 只在页面完全加载后调用初始化方法

**播放器没有正确清理**
- 确保在页面离开前调用了 `onPageLeave()` 方法
- 检查PJAX事件是否正确触发

**jQuery错误 ($ is not defined)**
- WordPress中应使用 `jQuery` 而不是 `$`
- 或者将代码包装在 `jQuery(document).ready(function($) { ... })` 中

#### 音频文件问题

**音频无法播放**
1. 检查文件路径是否正确
2. 确认服务器支持音频文件的MIME类型
3. 检查文件是否损坏

**歌词不显示**
1. 确认已启用歌词功能
2. 检查LRC文件格式是否正确
3. 确保歌词文件可以访问

### 性能优化

1. **音频文件优化**
   - 使用适当的音频压缩
   - 考虑文件大小对加载速度的影响

2. **PJAX优化**
   - 使用容器级别的播放器管理
   - 避免不必要的全局初始化

3. **缓存策略**
   - 启用浏览器缓存
   - 使用CDN加速（如需要）

## 🤝 贡献指南

欢迎贡献代码！如果你发现bug或有新功能建议：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [APlayer](https://github.com/DIYgod/APlayer) - 优秀的HTML5音乐播放器
- [WordPress](https://wordpress.org/) - 强大的内容管理系统
- [Gutenberg](https://wordpress.org/gutenberg/) - 现代化的区块编辑器

## 📞 支持

如果你喜欢这个插件，请给我们一个⭐！

如果遇到问题或有建议，请：
- 查看 [故障排除](#故障排除) 部分
- 阅读 [PJAX使用指南](./PJAX-USAGE.md)
- 提交 [Issue](../../issues)

---

<p align="center">
  Made with ❤️ for WordPress community
</p>
