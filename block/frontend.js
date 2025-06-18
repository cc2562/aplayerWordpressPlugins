/**
 * APlayer古腾堡区块前端脚本
 * 用于在前端初始化和管理APlayer实例以及Meting.js网易云音乐
 */

(function() {
    'use strict';

    // 存储所有APlayer实例
    window.aplayerInstances = window.aplayerInstances || {};

    /**
     * 初始化单个APlayer实例（本地文件模式）
     * @param {string} containerId - 容器ID
     * @param {Object} config - APlayer配置
     */
    function initAPlayer(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container || typeof APlayer === 'undefined') {
            console.warn('APlayer container not found or APlayer not loaded:', containerId);
            return;
        }

        try {
            // 如果已存在实例，先销毁
            if (window.aplayerInstances[containerId]) {
                window.aplayerInstances[containerId].destroy();
                delete window.aplayerInstances[containerId];
            }

            // 创建新的APlayer实例
            const playerConfig = {
                container: container,
                theme: config.theme || '#b7daff',
                loop: config.loop || 'all',
                order: config.order || 'list',
                preload: config.preload || 'auto',
                volume: config.volume || 0.7,
                listFolded: config.listFolded || false,
                listMaxHeight: config.listMaxHeight || '340px',
                autoplay: config.autoplay || false,
                lrcType: config.showLrc ? 1 : 0,
                audio: config.audio || []
            };

            // 处理音频数据
            if (playerConfig.audio.length > 0) {
                playerConfig.audio = playerConfig.audio.map(track => {
                    const audioTrack = {
                        name: track.name || '未知歌曲',
                        artist: track.artist || '未知艺术家',
                        url: track.url
                    };

                    if (track.cover) {
                        audioTrack.cover = track.cover;
                    }

                    if (track.lrc && playerConfig.lrcType) {
                        audioTrack.lrc = track.lrc;
                    }

                    return audioTrack;
                });

                // 创建APlayer实例
                const player = new APlayer(playerConfig);
                
                // 存储实例引用
                window.aplayerInstances[containerId] = player;

                // 添加事件监听器
                player.on('play', function() {
                    console.log('APlayer started playing:', containerId);
                });

                player.on('pause', function() {
                    console.log('APlayer paused:', containerId);
                });

                player.on('ended', function() {
                    console.log('APlayer finished playing:', containerId);
                });

                player.on('error', function() {
                    console.error('APlayer error occurred:', containerId);
                });

                // 添加播放器准备完成的标识
                container.classList.add('aplayer-ready');
                
                console.log('APlayer initialized successfully:', containerId);
            } else {
                container.innerHTML = '<div class="aplayer-empty"><p>没有可播放的音频文件</p></div>';
            }

        } catch (error) {
            console.error('Error initializing APlayer:', error);
            container.innerHTML = '<div class="aplayer-error"><p>播放器加载失败</p></div>';
        }
    }

    /**
     * 重新触发Meting.js的初始化
     */
    function triggerMetingInit() {
        if (typeof loadMeting === 'function') {
            try {
                loadMeting();
                console.log('Meting.js reinitialized');
            } catch (error) {
                console.error('Error reinitializing Meting.js:', error);
            }
        } else {
            console.warn('Meting.js loadMeting function not found');
        }
    }

    /**
     * 初始化页面上的所有APlayer区块
     */
    function initAllAPlayers() {
        // 初始化本地文件播放器
        const localContainers = document.querySelectorAll('.aplayer-gutenberg-block[data-aplayer-config]');
        
        localContainers.forEach(container => {
            try {
                const config = JSON.parse(container.dataset.aplayerConfig);
                const containerId = container.id;
                
                if (containerId && config) {
                    initAPlayer(containerId, config);
                }
            } catch (error) {
                console.error('Error parsing APlayer config:', error);
            }
        });

        // 触发Meting.js重新初始化以处理网易云音乐播放器
        triggerMetingInit();
    }

    /**
     * 清理所有APlayer实例
     */
    function destroyAllAPlayers() {
        Object.keys(window.aplayerInstances).forEach(containerId => {
            if (window.aplayerInstances[containerId]) {
                try {
                    window.aplayerInstances[containerId].destroy();
                } catch (error) {
                    console.warn('Error destroying APlayer instance:', containerId, error);
                }
                delete window.aplayerInstances[containerId];
            }
        });
    }

    /**
     * 页面可见性变化处理
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停所有播放器
            Object.keys(window.aplayerInstances).forEach(containerId => {
                const player = window.aplayerInstances[containerId];
                if (player && !player.paused) {
                    player.pause();
                }
            });
        }
    }

    /**
     * 窗口焦点变化处理
     */
    function handleFocusChange() {
        if (!document.hasFocus()) {
            // 失去焦点时暂停所有播放器（可选）
            Object.keys(window.aplayerInstances).forEach(containerId => {
                const player = window.aplayerInstances[containerId];
                if (player && !player.paused) {
                    // 可以选择是否暂停
                    // player.pause();
                }
            });
        }
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllAPlayers);
    } else {
        initAllAPlayers();
    }

    // 页面卸载时清理实例
    window.addEventListener('beforeunload', destroyAllAPlayers);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 监听窗口焦点变化
    window.addEventListener('blur', handleFocusChange);
    window.addEventListener('focus', handleFocusChange);

    // 为AJAX加载的内容提供手动初始化方法
    window.initAPlayerBlock = initAPlayer;
    window.initAllAPlayerBlocks = initAllAPlayers;
    window.destroyAllAPlayerBlocks = destroyAllAPlayers;
    window.triggerMetingInit = triggerMetingInit;

    /**
     * PJAX支持 - 页面切换时的回调处理
     */
    window.APlayerPJAX = {
        /**
         * 页面进入时的回调 - 初始化播放器
         * 建议在PJAX的success回调中调用
         */
        onPageEnter: function() {
            console.log('PJAX: Page entered, initializing APlayer blocks');
            setTimeout(initAllAPlayers, 100);
        },

        /**
         * 页面离开时的回调 - 清理播放器
         * 建议在PJAX的beforeSend或者complete回调中调用
         */
        onPageLeave: function() {
            console.log('PJAX: Page leaving, destroying APlayer blocks');
            destroyAllAPlayers();
        }
    };

    /**
     * 网易云音乐播放器支持
     * 监听Meting.js的状态变化
     */
    function monitorMetingPlayers() {
        // 定期检查网易云音乐播放器的状态
        const metingContainers = document.querySelectorAll('.aplayer-netease');
        
        metingContainers.forEach(container => {
            if (!container.classList.contains('meting-processed')) {
                container.classList.add('meting-processed');
                console.log('Meting container found:', container.id);
            }
        });
    }

    // 定期监控Meting播放器
    setInterval(monitorMetingPlayers, 1000);

    console.log('APlayer Gutenberg Block frontend script loaded');

})(); 