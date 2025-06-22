<?php
/**
 * Plugin Name: APlayer古腾堡区块
 * Plugin URI: https://github.com/DIYgod/APlayer
 * Description: 一个基于APlayer的古腾堡音乐播放器区块，支持播放WordPress媒体库中的音乐文件和网易云音乐
 * Version: 1.1.6
 * Author: CC米饭WithAI
 * License: MIT
 * Text Domain: aplayer-gutenberg-block
 * Domain Path: /languages
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

// 定义插件常量
define('APLAYER_GUTENBERG_BLOCK_VERSION', '1.1.6');
define('APLAYER_GUTENBERG_BLOCK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('APLAYER_GUTENBERG_BLOCK_PLUGIN_PATH', plugin_dir_path(__FILE__));

/**
 * 注册古腾堡区块
 */
function aplayer_gutenberg_block_init() {
    // 注册脚本和样式
    wp_register_script(
        'aplayer-js',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'dist/APlayer.min.js',
        array(),
        APLAYER_GUTENBERG_BLOCK_VERSION,
        true
    );

    // 注册Meting.js
    wp_register_script(
        'meting-js',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'src/Meting.js',
        array('aplayer-js'),
        APLAYER_GUTENBERG_BLOCK_VERSION,
        true
    );

    wp_register_style(
        'aplayer-css',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'dist/APlayer.min.css',
        array(),
        APLAYER_GUTENBERG_BLOCK_VERSION
    );

    // 注册编辑器脚本
    wp_register_script(
        'aplayer-gutenberg-block-editor',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'block/block.js',
        array(
            'wp-blocks',
            'wp-i18n',
            'wp-element',
            'wp-components',
            'wp-block-editor',
            'wp-data',
            'wp-compose'
        ),
        APLAYER_GUTENBERG_BLOCK_VERSION,
        true
    );

    wp_register_style(
        'aplayer-gutenberg-block-editor',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'block/editor.css',
        array('aplayer-css'),
        APLAYER_GUTENBERG_BLOCK_VERSION
    );

    // 注册前端脚本
    wp_register_script(
        'aplayer-gutenberg-block-frontend',
        APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'block/frontend.js',
        array('aplayer-js', 'meting-js'),
        APLAYER_GUTENBERG_BLOCK_VERSION,
        true
    );

    // 注册区块
    register_block_type('aplayer-gutenberg-block/music-player', array(
        'editor_script' => 'aplayer-gutenberg-block-editor',
        'editor_style' => 'aplayer-gutenberg-block-editor',
        'script' => 'aplayer-gutenberg-block-frontend',
        'style' => 'aplayer-css',
        'render_callback' => 'aplayer_gutenberg_block_render',
        'attributes' => array(
            // 音乐来源类型
            'sourceType' => array(
                'type' => 'string',
                'default' => 'local' // local, netease
            ),
            // 本地音频文件
            'audioTracks' => array(
                'type' => 'array',
                'default' => array()
            ),
            // 网易云音乐设置
            'neteaseType' => array(
                'type' => 'string',
                'default' => 'song' // song, playlist
            ),
            'neteaseId' => array(
                'type' => 'string',
                'default' => ''
            ),
            'neteaseAutoUrl' => array(
                'type' => 'string',
                'default' => ''
            ),
            // 播放器设置
            'theme' => array(
                'type' => 'string',
                'default' => '#b7daff'
            ),
            'loop' => array(
                'type' => 'string',
                'default' => 'all'
            ),
            'order' => array(
                'type' => 'string',
                'default' => 'list'
            ),
            'preload' => array(
                'type' => 'string',
                'default' => 'auto'
            ),
            'volume' => array(
                'type' => 'number',
                'default' => 0.7
            ),
            'listFolded' => array(
                'type' => 'boolean',
                'default' => false
            ),
            'listMaxHeight' => array(
                'type' => 'string',
                'default' => '340px'
            ),
            'autoplay' => array(
                'type' => 'boolean',
                'default' => false
            ),
            'showLrc' => array(
                'type' => 'boolean',
                'default' => false
            )
        )
    ));
}
add_action('init', 'aplayer_gutenberg_block_init');

/**
 * 添加设置页面
 */
function aplayer_gutenberg_block_admin_menu() {
    add_options_page(
        __('APlayer 设置', 'aplayer-gutenberg-block'),
        __('APlayer 设置', 'aplayer-gutenberg-block'),
        'manage_options',
        'aplayer-gutenberg-block-settings',
        'aplayer_gutenberg_block_settings_page'
    );
}
add_action('admin_menu', 'aplayer_gutenberg_block_admin_menu');

/**
 * 设置页面内容
 */
function aplayer_gutenberg_block_settings_page() {
    // 保存设置
    if (isset($_POST['submit'])) {
        check_admin_referer('aplayer_settings');
        
        $api_url = sanitize_text_field($_POST['meting_api_url']);
        update_option('aplayer_meting_api_url', $api_url);
        
        echo '<div class="notice notice-success"><p>' . __('设置已保存', 'aplayer-gutenberg-block') . '</p></div>';
    }
    
    $current_api_url = get_option('aplayer_meting_api_url', '');
    
    ?>
    <div class="wrap">
        <h1><?php echo __('APlayer 设置', 'aplayer-gutenberg-block'); ?></h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('aplayer_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="meting_api_url"><?php echo __('Meting API URL', 'aplayer-gutenberg-block'); ?></label>
                    </th>
                    <td>
                        <input type="url" 
                               id="meting_api_url" 
                               name="meting_api_url" 
                               value="<?php echo esc_attr($current_api_url); ?>" 
                               class="regular-text" 
                               placeholder="https://your-domain.com/meting/?server=:server&type=:type&id=:id&r=:r" />
                        <p class="description">
                            <?php echo __('自定义Meting API地址，留空使用默认内置API。格式必须包含 :server、:type、:id、:r 占位符。', 'aplayer-gutenberg-block'); ?>
                        </p>
                        <p class="description">
                            <strong><?php echo __('当前内置API地址：', 'aplayer-gutenberg-block'); ?></strong>
                            <code><?php echo esc_html(APLAYER_GUTENBERG_BLOCK_PLUGIN_URL . 'metingapi/wp-api.php'); ?></code>
                        </p>
                        <p class="description">
                            <strong><?php echo __('示例：', 'aplayer-gutenberg-block'); ?></strong>
                            <code>https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r</code>
                        </p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(__('保存设置', 'aplayer-gutenberg-block')); ?>
        </form>
        
        <div style="margin-top: 30px; padding: 15px; background: #f1f1f1; border-left: 4px solid #0073aa;">
            <h3><?php echo __('关于Meting API', 'aplayer-gutenberg-block'); ?></h3>
            <p><?php echo __('由于官方Meting API可能失效，建议您搭建自己的API服务器。', 'aplayer-gutenberg-block'); ?></p>
            <p>
                <strong><?php echo __('内置API：', 'aplayer-gutenberg-block'); ?></strong>
                <?php echo __('插件已内置Meting API（位于metingapi文件夹），会自动适配您的插件安装路径，无需额外配置即可使用。', 'aplayer-gutenberg-block'); ?>
            </p>
            <p>
                <strong><?php echo __('自建API：', 'aplayer-gutenberg-block'); ?></strong>
                <?php echo __('参考', 'aplayer-gutenberg-block'); ?> 
                <a href="https://github.com/injahow/meting-api" target="_blank">meting-api</a>
                <?php echo __('项目搭建您自己的API服务器。', 'aplayer-gutenberg-block'); ?>
            </p>
        </div>
    </div>
    <?php
}

/**
 * 输出API配置和插件路径到前端
 */
function aplayer_gutenberg_block_enqueue_api_config() {
    $api_url = get_option('aplayer_meting_api_url', '');
    $plugin_url = APLAYER_GUTENBERG_BLOCK_PLUGIN_URL;
    
    echo '<script>' . "\n";
    echo 'window.aplayerPluginUrl = "' . esc_js($plugin_url) . '";' . "\n";
    
    if (!empty($api_url)) {
        // 如果设置了自定义API，使用自定义API
        echo 'window.meting_api = "' . esc_js($api_url) . '";' . "\n";
    } else {
        // 否则使用内置API，动态生成路径
        echo 'window.meting_api = window.aplayerPluginUrl + "metingapi/wp-api.php?server=:server&type=:type&id=:id&r=:r";' . "\n";
    }
    echo '</script>' . "\n";
}
add_action('wp_head', 'aplayer_gutenberg_block_enqueue_api_config');

/**
 * 区块渲染回调函数
 */
function aplayer_gutenberg_block_render($attributes) {
    // 生成唯一ID
    $player_id = 'aplayer-' . substr(wp_generate_uuid4(), 0, 8);
    
    // 根据音乐来源类型渲染不同的播放器
    if ($attributes['sourceType'] === 'netease') {
        // 网易云音乐模式
        return render_netease_player($player_id, $attributes);
    } else {
        // 本地文件模式
        return render_local_player($player_id, $attributes);
    }
}

/**
 * 渲染网易云音乐播放器
 */
function render_netease_player($player_id, $attributes) {
    // 如果既没有ID也没有自动URL，返回占位符
    if (empty($attributes['neteaseId']) && empty($attributes['neteaseAutoUrl'])) {
        return '<div class="aplayer-placeholder" style="padding: 20px; text-align: center; border: 2px dashed #ddd; background: #f9f9f9;">' . 
               __('请设置网易云音乐ID或链接', 'aplayer-gutenberg-block') . 
               '</div>';
    }

    $data_attrs = array(
        'class' => 'aplayer aplayer-netease',
        'id' => $player_id,
        'data-server' => 'netease',
        'data-theme' => $attributes['theme'],
        'data-loop' => $attributes['loop'],
        'data-order' => $attributes['order'],
        'data-preload' => $attributes['preload'],
        'data-volume' => $attributes['volume'],
        'data-listfolded' => $attributes['listFolded'] ? 'true' : 'false',
        'data-listmaxheight' => $attributes['listMaxHeight'],
        'data-autoplay' => $attributes['autoplay'] ? 'true' : 'false',
        'data-lrctype' => $attributes['showLrc'] ? '3' : '0',
        'data-mutex' => 'true',
        'data-storagename' => 'metingjs'
    );

    // 使用自动解析URL还是手动设置ID
    if (!empty($attributes['neteaseAutoUrl'])) {
        $data_attrs['data-auto'] = $attributes['neteaseAutoUrl'];
    } else {
        $data_attrs['data-type'] = $attributes['neteaseType'];
        $data_attrs['data-id'] = $attributes['neteaseId'];
    }

    // 构建HTML属性字符串
    $html_attrs = '';
    foreach ($data_attrs as $key => $value) {
        $html_attrs .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
    }

    return '<div' . $html_attrs . '></div>';
}

/**
 * 渲染本地文件播放器
 */
function render_local_player($player_id, $attributes) {
    // 如果没有音轨，返回空
    if (empty($attributes['audioTracks'])) {
        return '<div class="aplayer-placeholder" style="padding: 20px; text-align: center; border: 2px dashed #ddd; background: #f9f9f9;">' . 
               __('请添加音乐文件', 'aplayer-gutenberg-block') . 
               '</div>';
    }
    
    // 准备APlayer配置
    $config = array(
        'theme' => $attributes['theme'],
        'loop' => $attributes['loop'],
        'order' => $attributes['order'],
        'preload' => $attributes['preload'],
        'volume' => $attributes['volume'],
        'listFolded' => $attributes['listFolded'],
        'listMaxHeight' => $attributes['listMaxHeight'],
        'autoplay' => $attributes['autoplay'],
        'showLrc' => $attributes['showLrc'],
        'audio' => array()
    );

    // 处理音轨数据
    foreach ($attributes['audioTracks'] as $track) {
        $audio_item = array(
            'name' => $track['name'],
            'artist' => $track['artist'],
            'url' => $track['url']
        );
        
        if (!empty($track['cover'])) {
            $audio_item['cover'] = $track['cover'];
        }
        
        if (!empty($track['lrc'])) {
            $audio_item['lrc'] = $track['lrc'];
        }

        $config['audio'][] = $audio_item;
    }

    // 生成HTML
    $html = '<div id="' . esc_attr($player_id) . '" class="aplayer-gutenberg-block" data-aplayer-config="' . esc_attr(wp_json_encode($config)) . '"></div>';

    return $html;
}

/**
 * 加载文本域
 */
function aplayer_gutenberg_block_load_textdomain() {
    load_plugin_textdomain(
        'aplayer-gutenberg-block',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages/'
    );
}
add_action('plugins_loaded', 'aplayer_gutenberg_block_load_textdomain');

/**
 * 添加REST API端点用于获取媒体文件信息
 */
function aplayer_gutenberg_block_register_rest_routes() {
    register_rest_route('aplayer-gutenberg-block/v1', '/media/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'aplayer_gutenberg_block_get_media_info',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'id' => array(
                'validate_callback' => function($param, $request, $key) {
                    return is_numeric($param);
                }
            )
        )
    ));
}
add_action('rest_api_init', 'aplayer_gutenberg_block_register_rest_routes');

/**
 * 获取媒体文件信息的回调函数
 */
function aplayer_gutenberg_block_get_media_info($request) {
    $media_id = $request['id'];
    $attachment = get_post($media_id);
    
    if (!$attachment || $attachment->post_type !== 'attachment') {
        return new WP_Error('invalid_media', __('无效的媒体文件ID', 'aplayer-gutenberg-block'), array('status' => 404));
    }

    $file_url = wp_get_attachment_url($media_id);
    $metadata = wp_get_attachment_metadata($media_id);
    
    // 获取音频元数据
    $duration = 0;
    $artist = '';
    $album = '';
    
    if (isset($metadata['length_formatted'])) {
        $duration = $metadata['length_formatted'];
    }
    
    // 尝试从文件元数据中获取艺术家和专辑信息
    if (function_exists('wp_read_audio_metadata')) {
        $audio_metadata = wp_read_audio_metadata($file_url);
        if ($audio_metadata) {
            $artist = $audio_metadata['artist'] ?? '';
            $album = $audio_metadata['album'] ?? '';
        }
    }

    return array(
        'id' => $media_id,
        'url' => $file_url,
        'title' => $attachment->post_title,
        'filename' => basename($file_url),
        'artist' => $artist,
        'album' => $album,
        'duration' => $duration,
        'mime_type' => $attachment->post_mime_type
    );
} 