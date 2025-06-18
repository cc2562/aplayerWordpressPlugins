<?php
/**
 * Plugin Name: APlayer古腾堡区块
 * Plugin URI: https://github.com/DIYgod/APlayer
 * Description: 一个基于APlayer的古腾堡音乐播放器区块，支持播放WordPress媒体库中的音乐文件
 * Version: 1.0.3
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
define('APLAYER_GUTENBERG_BLOCK_VERSION', '1.0.3');
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
        array('aplayer-js'),
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
            'audioTracks' => array(
                'type' => 'array',
                'default' => array()
            ),
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
 * 区块渲染回调函数
 */
function aplayer_gutenberg_block_render($attributes) {
    // 如果没有音轨，返回空
    if (empty($attributes['audioTracks'])) {
        return '<div class="aplayer-placeholder" style="padding: 20px; text-align: center; border: 2px dashed #ddd; background: #f9f9f9;">' . 
               __('请添加音乐文件', 'aplayer-gutenberg-block') . 
               '</div>';
    }

    // 生成唯一ID
    $player_id = 'aplayer-' . substr(wp_generate_uuid4(), 0, 8);
    
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