(function() {
    'use strict';

    const { __, sprintf } = wp.i18n;
    const { registerBlockType } = wp.blocks;
    const { 
        PanelBody, 
        Button, 
        TextControl, 
        ColorPicker, 
        SelectControl,
        ToggleControl,
        RangeControl,
        Notice
    } = wp.components;
    const { 
        InspectorControls, 
        MediaUpload, 
        MediaUploadCheck 
    } = wp.blockEditor;
    const { Fragment, useState, useEffect } = wp.element;
    const { useSelect } = wp.data;

    // 注册APlayer音乐播放器区块
    registerBlockType('aplayer-gutenberg-block/music-player', {
        title: __('APlayer 音乐播放器', 'aplayer-gutenberg-block'),
        icon: 'controls-play',
        category: 'media',
        keywords: [
            __('音乐', 'aplayer-gutenberg-block'),
            __('播放器', 'aplayer-gutenberg-block'),
            __('audio', 'aplayer-gutenberg-block'),
            __('aplayer', 'aplayer-gutenberg-block'),
            __('网易云', 'aplayer-gutenberg-block')
        ],
        description: __('一个功能强大的HTML5音乐播放器，支持本地文件和网易云音乐', 'aplayer-gutenberg-block'),
        supports: {
            align: ['wide', 'full']
        },
        attributes: {
            // 音乐来源类型
            sourceType: {
                type: 'string',
                default: 'local' // local, netease
            },
            // 本地音频文件
            audioTracks: {
                type: 'array',
                default: []
            },
            // 网易云音乐设置
            neteaseType: {
                type: 'string',
                default: 'song' // song, playlist
            },
            neteaseId: {
                type: 'string',
                default: ''
            },
            neteaseAutoUrl: {
                type: 'string',
                default: ''
            },
            // 播放器设置
            theme: {
                type: 'string',
                default: '#b7daff'
            },
            loop: {
                type: 'string',
                default: 'all'
            },
            order: {
                type: 'string',
                default: 'list'
            },
            preload: {
                type: 'string',
                default: 'auto'
            },
            volume: {
                type: 'number',
                default: 0.7
            },
            listFolded: {
                type: 'boolean',
                default: false
            },
            listMaxHeight: {
                type: 'string',
                default: '340px'
            },
            autoplay: {
                type: 'boolean',
                default: false
            },
            showLrc: {
                type: 'boolean',
                default: false
            }
        },

        edit: function(props) {
            const { attributes, setAttributes, clientId } = props;
            const { 
                sourceType,
                audioTracks,
                neteaseType,
                neteaseId,
                neteaseAutoUrl,
                theme, 
                loop, 
                order, 
                preload, 
                volume, 
                listFolded, 
                listMaxHeight, 
                autoplay, 
                showLrc 
            } = attributes;

            const [isLoadingMedia, setIsLoadingMedia] = useState(false);

            // 添加音频文件
            const onSelectAudio = (media) => {
                setIsLoadingMedia(true);
                
                // 获取媒体信息
                wp.apiFetch({
                    path: `/aplayer-gutenberg-block/v1/media/${media.id}`
                }).then((mediaInfo) => {
                    const newTrack = {
                        id: mediaInfo.id,
                        name: mediaInfo.title || mediaInfo.filename,
                        artist: mediaInfo.artist || __('未知艺术家', 'aplayer-gutenberg-block'),
                        url: mediaInfo.url,
                        cover: '',
                        lrc: ''
                    };
                    
                    setAttributes({
                        audioTracks: [...audioTracks, newTrack]
                    });
                    setIsLoadingMedia(false);
                }).catch((error) => {
                    console.error('Error fetching media info:', error);
                    setIsLoadingMedia(false);
                });
            };

            // 移除音频文件
            const removeTrack = (index) => {
                const newTracks = [...audioTracks];
                newTracks.splice(index, 1);
                setAttributes({ audioTracks: newTracks });
            };

            // 更新音轨信息
            const updateTrack = (index, field, value) => {
                const newTracks = [...audioTracks];
                newTracks[index][field] = value;
                setAttributes({ audioTracks: newTracks });
            };

            // 选择封面图片
            const onSelectCover = (media, index) => {
                updateTrack(index, 'cover', media.url);
            };

            // 从网易云音乐链接提取ID
            const extractNeteaseId = (url) => {
                if (!url) return;
                
                // 匹配歌曲ID
                let match = url.match(/song\?id=(\d+)/);
                if (match) {
                    setAttributes({
                        neteaseType: 'song',
                        neteaseId: match[1],
                        neteaseAutoUrl: ''
                    });
                    return;
                }
                
                // 匹配歌单ID
                match = url.match(/playlist\?id=(\d+)/);
                if (match) {
                    setAttributes({
                        neteaseType: 'playlist',
                        neteaseId: match[1],
                        neteaseAutoUrl: ''
                    });
                    return;
                }
                
                // 如果无法解析，使用自动模式
                setAttributes({
                    neteaseAutoUrl: url,
                    neteaseId: ''
                });
            };

            return (
                wp.element.createElement(Fragment, null,
                    // 侧边栏控制面板
                    wp.element.createElement(InspectorControls, null,
                        wp.element.createElement(PanelBody, {
                            title: __('音乐来源', 'aplayer-gutenberg-block'),
                            initialOpen: true
                        },
                            wp.element.createElement(SelectControl, {
                                label: __('选择音乐来源', 'aplayer-gutenberg-block'),
                                value: sourceType,
                                options: [
                                    { label: __('本地文件', 'aplayer-gutenberg-block'), value: 'local' },
                                    { label: __('网易云音乐', 'aplayer-gutenberg-block'), value: 'netease' }
                                ],
                                onChange: (value) => setAttributes({ sourceType: value })
                            }),

                            // 网易云音乐设置
                            sourceType === 'netease' && wp.element.createElement(Fragment, null,
                                wp.element.createElement('div', { style: { marginTop: '16px' } },
                                    wp.element.createElement('p', { style: { fontSize: '13px', color: '#666' } },
                                        __('支持网易云音乐歌曲和歌单链接，或手动输入ID', 'aplayer-gutenberg-block')
                                    )
                                ),
                                
                                wp.element.createElement(TextControl, {
                                    label: __('网易云音乐链接', 'aplayer-gutenberg-block'),
                                    value: neteaseAutoUrl,
                                    onChange: (value) => {
                                        setAttributes({ neteaseAutoUrl: value });
                                        extractNeteaseId(value);
                                    },
                                    placeholder: __('粘贴网易云音乐链接...', 'aplayer-gutenberg-block'),
                                    help: __('例如：https://music.163.com/song?id=123456', 'aplayer-gutenberg-block')
                                }),

                                wp.element.createElement('div', { style: { margin: '16px 0', textAlign: 'center', color: '#666' } },
                                    __('— 或者 —', 'aplayer-gutenberg-block')
                                ),

                                wp.element.createElement(SelectControl, {
                                    label: __('类型', 'aplayer-gutenberg-block'),
                                    value: neteaseType,
                                    options: [
                                        { label: __('单曲', 'aplayer-gutenberg-block'), value: 'song' },
                                        { label: __('歌单', 'aplayer-gutenberg-block'), value: 'playlist' }
                                    ],
                                    onChange: (value) => setAttributes({ neteaseType: value })
                                }),

                                wp.element.createElement(TextControl, {
                                    label: __('ID', 'aplayer-gutenberg-block'),
                                    value: neteaseId,
                                    onChange: (value) => setAttributes({ neteaseId: value }),
                                    placeholder: __('输入歌曲或歌单ID...', 'aplayer-gutenberg-block'),
                                    help: __('从网易云音乐链接中提取的数字ID', 'aplayer-gutenberg-block')
                                })
                            )
                        ),

                        wp.element.createElement(PanelBody, {
                            title: __('播放器设置', 'aplayer-gutenberg-block'),
                            initialOpen: false
                        },
                            wp.element.createElement('div', { style: { marginBottom: '16px' } },
                                wp.element.createElement('label', null, __('主题颜色', 'aplayer-gutenberg-block')),
                                wp.element.createElement(ColorPicker, {
                                    color: theme,
                                    onChangeComplete: (color) => setAttributes({ theme: color.hex })
                                })
                            ),
                            wp.element.createElement(SelectControl, {
                                label: __('循环模式', 'aplayer-gutenberg-block'),
                                value: loop,
                                options: [
                                    { label: __('全部循环', 'aplayer-gutenberg-block'), value: 'all' },
                                    { label: __('单曲循环', 'aplayer-gutenberg-block'), value: 'one' },
                                    { label: __('不循环', 'aplayer-gutenberg-block'), value: 'none' }
                                ],
                                onChange: (value) => setAttributes({ loop: value })
                            }),
                            wp.element.createElement(SelectControl, {
                                label: __('播放顺序', 'aplayer-gutenberg-block'),
                                value: order,
                                options: [
                                    { label: __('列表顺序', 'aplayer-gutenberg-block'), value: 'list' },
                                    { label: __('随机播放', 'aplayer-gutenberg-block'), value: 'random' }
                                ],
                                onChange: (value) => setAttributes({ order: value })
                            }),
                            wp.element.createElement(RangeControl, {
                                label: __('默认音量', 'aplayer-gutenberg-block'),
                                value: volume,
                                onChange: (value) => setAttributes({ volume: value }),
                                min: 0,
                                max: 1,
                                step: 0.1
                            }),
                            wp.element.createElement(ToggleControl, {
                                label: __('自动播放', 'aplayer-gutenberg-block'),
                                checked: autoplay,
                                onChange: (value) => setAttributes({ autoplay: value })
                            }),
                            wp.element.createElement(ToggleControl, {
                                label: __('折叠播放列表', 'aplayer-gutenberg-block'),
                                checked: listFolded,
                                onChange: (value) => setAttributes({ listFolded: value })
                            }),
                                                            wp.element.createElement(ToggleControl, {
                                    label: __('显示歌词', 'aplayer-gutenberg-block'),
                                    checked: showLrc,
                                    onChange: (value) => setAttributes({ showLrc: value }),
                                    help: sourceType === 'netease' ? 
                                        __('网易云音乐会自动获取歌词（如果可用）', 'aplayer-gutenberg-block') :
                                        __('本地文件需要手动添加LRC格式歌词', 'aplayer-gutenberg-block')
                                })
                        ),

                        // 本地音乐管理面板
                        sourceType === 'local' && wp.element.createElement(PanelBody, {
                            title: __('本地音乐管理', 'aplayer-gutenberg-block'),
                            initialOpen: true
                        },
                            wp.element.createElement(MediaUploadCheck, null,
                                wp.element.createElement(MediaUpload, {
                                    onSelect: onSelectAudio,
                                    allowedTypes: ['audio'],
                                    multiple: false,
                                    render: ({ open }) => (
                                        wp.element.createElement(Button, {
                                            onClick: open,
                                            isPrimary: true,
                                            isLarge: true,
                                            disabled: isLoadingMedia
                                        }, isLoadingMedia ? __('加载中...', 'aplayer-gutenberg-block') : __('添加音乐文件', 'aplayer-gutenberg-block'))
                                    )
                                })
                            ),

                            // 音频文件列表
                            audioTracks.map((track, index) => (
                                wp.element.createElement('div', {
                                    key: index,
                                    style: {
                                        border: '1px solid #ddd',
                                        padding: '12px',
                                        marginTop: '12px',
                                        borderRadius: '4px'
                                    }
                                },
                                    wp.element.createElement('div', {
                                        style: { marginBottom: '8px', fontWeight: 'bold' }
                                    }, `${__('音轨', 'aplayer-gutenberg-block')} ${index + 1}`),
                                    
                                    wp.element.createElement(TextControl, {
                                        label: __('歌曲名称', 'aplayer-gutenberg-block'),
                                        value: track.name,
                                        onChange: (value) => updateTrack(index, 'name', value)
                                    }),
                                    
                                    wp.element.createElement(TextControl, {
                                        label: __('艺术家', 'aplayer-gutenberg-block'),
                                        value: track.artist,
                                        onChange: (value) => updateTrack(index, 'artist', value)
                                    }),

                                    showLrc && wp.element.createElement('div', null,
                                        wp.element.createElement('label', null, __('歌词 (LRC格式)', 'aplayer-gutenberg-block')),
                                        wp.element.createElement('textarea', {
                                            value: track.lrc,
                                            onChange: (e) => updateTrack(index, 'lrc', e.target.value),
                                            placeholder: __('粘贴LRC格式的歌词...', 'aplayer-gutenberg-block'),
                                            rows: 4,
                                            style: { width: '100%', marginTop: '4px' }
                                        })
                                    ),

                                    wp.element.createElement('div', {
                                        style: { marginTop: '8px' }
                                    },
                                        wp.element.createElement(MediaUploadCheck, null,
                                            wp.element.createElement(MediaUpload, {
                                                onSelect: (media) => onSelectCover(media, index),
                                                allowedTypes: ['image'],
                                                multiple: false,
                                                render: ({ open }) => (
                                                    wp.element.createElement(Button, {
                                                        onClick: open,
                                                        isSecondary: true,
                                                        isSmall: true
                                                    }, track.cover ? __('更换封面', 'aplayer-gutenberg-block') : __('选择封面', 'aplayer-gutenberg-block'))
                                                )
                                            })
                                        ),
                                        
                                        track.cover && wp.element.createElement('div', {
                                            style: { marginTop: '8px' }
                                        },
                                            wp.element.createElement('img', {
                                                src: track.cover,
                                                style: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }
                                            }),
                                            wp.element.createElement(Button, {
                                                onClick: () => updateTrack(index, 'cover', ''),
                                                isDestructive: true,
                                                isSmall: true,
                                                style: { marginLeft: '8px' }
                                            }, __('移除封面', 'aplayer-gutenberg-block'))
                                        )
                                    ),

                                    wp.element.createElement('div', {
                                        style: { marginTop: '12px', textAlign: 'right' }
                                    },
                                        wp.element.createElement(Button, {
                                            onClick: () => removeTrack(index),
                                            isDestructive: true,
                                            isSmall: true
                                        }, __('移除此音轨', 'aplayer-gutenberg-block'))
                                    )
                                )
                            ))
                        )
                    ),

                    // 编辑器中的预览
                    wp.element.createElement('div', {
                        className: 'aplayer-gutenberg-block-preview',
                        style: {
                            border: '2px dashed #ccc',
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: '#f9f9f9'
                        }
                    },
                        wp.element.createElement('div', {
                            style: {
                                fontSize: '18px',
                                marginBottom: '10px',
                                color: '#666'
                            }
                        }, sourceType === 'netease' ? '🎵 网易云音乐播放器' : '🎵 APlayer 音乐播放器'),
                        
                        sourceType === 'netease' ? 
                            // 网易云音乐预览
                            wp.element.createElement('div', null,
                                (!neteaseId && !neteaseAutoUrl) ? 
                                    wp.element.createElement('p', null, __('请设置网易云音乐ID或链接', 'aplayer-gutenberg-block')) :
                                    wp.element.createElement('div', null,
                                        wp.element.createElement('p', null, 
                                            neteaseAutoUrl ? 
                                                __('自动解析链接模式', 'aplayer-gutenberg-block') :
                                                sprintf(
                                                    __('网易云%s - ID: %s', 'aplayer-gutenberg-block'), 
                                                    neteaseType === 'song' ? __('单曲', 'aplayer-gutenberg-block') : __('歌单', 'aplayer-gutenberg-block'),
                                                    neteaseId
                                                )
                                        ),
                                        wp.element.createElement('small', { style: { color: '#666' } },
                                            showLrc ? 
                                                __('🎵 网易云音乐将在前端加载显示（含歌词）', 'aplayer-gutenberg-block') :
                                                __('🎵 网易云音乐将在前端加载显示', 'aplayer-gutenberg-block')
                                        )
                                    )
                            ) :
                            // 本地文件预览
                            (audioTracks.length === 0 ? 
                                wp.element.createElement('p', null, __('请添加音乐文件开始使用', 'aplayer-gutenberg-block')) :
                                wp.element.createElement('div', null,
                                    wp.element.createElement('p', null, 
                                        sprintf(
                                            __('已添加 %d 首音乐', 'aplayer-gutenberg-block'), 
                                            audioTracks.length
                                        )
                                    ),
                                    wp.element.createElement('ul', {
                                        style: { textAlign: 'left', maxHeight: '150px', overflow: 'auto' }
                                    },
                                        audioTracks.map((track, index) => (
                                            wp.element.createElement('li', { key: index },
                                                `${track.name} - ${track.artist}`
                                            )
                                        ))
                                    ),
                                    wp.element.createElement('small', { style: { color: '#666' } },
                                        __('🎵 播放器将在前端显示', 'aplayer-gutenberg-block')
                                    )
                                )
                            )
                    )
                )
            );
        },

        save: function() {
            // 使用动态渲染，这里返回null
            return null;
        }
    });

})(); 