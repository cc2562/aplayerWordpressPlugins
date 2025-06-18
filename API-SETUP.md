# Meting API 配置说明

## 概述

由于官方 Meting API 经常失效，本插件已内置完整的 Meting API 服务，确保网易云音乐功能的稳定运行。

## 内置API的优势

- ✅ **即开即用** - 无需额外配置，安装插件后直接可用
- ✅ **本地化服务** - 不依赖外部API，避免第三方服务失效风险
- ✅ **智能路径检测** - 自动适配插件文件夹名称，支持任意安装路径
- ✅ **智能缓存** - 自动缓存播放列表，提高加载速度
- ✅ **中文歌词支持** - 原生支持中文歌词显示
- ✅ **WordPress集成** - 完美集成WordPress缓存系统

## 内置API的工作原理

插件的 `metingapi` 文件夹包含了一个完整的 Meting API 实现：

```
metingapi/
├── src/           # Meting核心类库
├── vendor/        # Composer依赖包
├── wp-api.php     # WordPress兼容的API接口
├── index.php      # 原版API接口
└── README.md      # API文档
```

当用户使用网易云音乐功能时，插件会自动调用内置API：
```
https://your-site.com/wp-content/plugins/[插件文件夹名]/metingapi/wp-api.php
```

**智能路径检测**：插件会自动检测实际的安装路径，无论您的插件文件夹叫什么名称都能正常工作。

## 智能路径检测机制

插件采用多层路径检测机制，确保在任何安装情况下都能正常工作：

### 1. WordPress集成检测（优先级最高）
插件会通过WordPress的 `plugin_dir_url()` 函数自动获取正确的插件URL，并输出到前端：
```javascript
window.aplayerPluginUrl = "https://your-site.com/wp-content/plugins/actual-folder-name/";
```

### 2. 自定义API配置（次优先级）
如果在WordPress后台设置了自定义API地址，会优先使用用户配置的API：
```javascript
window.meting_api = "https://your-custom-api.com/meting/?server=:server&type=:type&id=:id&r=:r";
```

### 3. 脚本路径检测（降级方案）
如果前两种方法都失效，插件会尝试从当前加载的Meting.js脚本路径反推插件目录：
```javascript
// 自动检测脚本src属性，推断插件路径
const scriptSrc = "https://site.com/wp-content/plugins/some-name/src/Meting.js";
const pluginPath = "https://site.com/wp-content/plugins/some-name/";
```

### 4. 降级到官方API（最后方案）
如果所有检测都失败，会使用原版官方API（但可能不可用）并在控制台显示警告。

### 支持的安装方式

- ✅ 标准WordPress插件目录安装
- ✅ 重命名插件文件夹
- ✅ 符号链接安装
- ✅ 自定义wp-content路径
- ✅ 多站点(Multisite)环境
- ✅ 子目录安装的WordPress

## 自定义API配置

### 方法一：WordPress后台配置

1. 登录WordPress管理后台
2. 进入 **设置** → **APlayer设置**
3. 在 "Meting API URL" 字段中输入您的API地址
4. 点击"保存设置"

### 方法二：代码配置

在您的主题的 `functions.php` 文件中添加：

```php
// 设置自定义Meting API
add_action('wp_head', function() {
    echo '<script>window.meting_api = "https://your-api-domain.com/meting/?server=:server&type=:type&id=:id&r=:r";</script>';
});
```

### 方法三：直接在页面中配置

在页面的 `<head>` 部分添加：

```html
<script>
window.meting_api = 'https://your-api-domain.com/meting/?server=:server&type=:type&id=:id&r=:r';
</script>
```

## 搭建自己的API服务器

如果您需要搭建独立的API服务器，可以参考以下步骤：

### 1. 克隆meting-api项目

```bash
git clone https://github.com/injahow/meting-api.git
cd meting-api
```

### 2. 安装依赖

```bash
composer install
```

### 3. 配置API

编辑 `index.php` 文件，修改配置参数：

```php
<?php
// 设置中文歌词
define('TLYRIC', true);
// 设置缓存
define('CACHE', true);
define('CACHE_TIME', 86400);
// 设置AUTH密钥（可选）
define('AUTH', false);
```

### 4. 部署到服务器

将整个项目上传到您的Web服务器，确保：
- PHP 5.4+ 
- 已安装 BCMath, Curl, OpenSSL 扩展
- Web服务器支持URL重写

### 5. 测试API

访问以下URL测试API是否正常：
```
https://your-domain.com/meting/?type=song&id=591321
```

## API接口说明

### 支持的参数

| 参数 | 必需 | 说明 | 示例 |
|------|------|------|------|
| server | 否 | 音乐平台 | netease（默认）、tencent、kugou |
| type | 是 | 请求类型 | song、playlist、url、pic、lrc |
| id | 是 | 资源ID | 歌曲ID或歌单ID |
| auth | 否 | 认证密钥 | 当启用AUTH时需要 |

### 请求示例

```bash
# 获取歌曲信息
curl "https://your-api.com/meting/?type=song&id=591321"

# 获取歌单信息
curl "https://your-api.com/meting/?type=playlist&id=2619366284"

# 获取歌曲URL
curl "https://your-api.com/meting/?type=url&id=591321"

# 获取歌词
curl "https://your-api.com/meting/?type=lrc&id=591321"
```

## 性能优化建议

### 1. 启用缓存

```php
// 启用文件缓存
define('CACHE', true);
define('CACHE_TIME', 86400); // 24小时

// 启用APCu缓存（如果服务器支持）
define('APCU_CACHE', true);
```

### 2. 使用CDN

如果您的API服务器在海外，建议使用CDN加速音频文件的传输。

### 3. 负载均衡

对于高并发场景，可以部署多个API服务器实例并使用负载均衡。

## 常见问题

### Q: 内置API是否会影响网站性能？
A: 不会。内置API只在用户访问包含网易云音乐播放器的页面时才会被调用，且已优化了缓存机制。

### Q: 如何确认API是否正常工作？
A: 可以在浏览器中直接访问API测试URL，或查看浏览器开发者工具的网络请求。

### Q: 是否支持其他音乐平台？
A: 目前主要针对网易云音乐进行了优化，其他平台可能需要额外配置。

### Q: 如何备份API配置？
A: API配置保存在WordPress数据库的 `wp_options` 表中，随WordPress一起备份即可。

## 技术支持

如果您在配置过程中遇到问题：

1. 检查PHP版本和扩展是否符合要求
2. 查看服务器错误日志
3. 测试API接口是否返回正确数据
4. 检查防火墙和安全策略

更多技术细节请参考：
- [meting-api项目](https://github.com/injahow/meting-api)
- [APlayer文档](https://aplayer.js.org/)
- [MetingJS文档](https://github.com/metowolf/MetingJS) 