console.log(`${'\n'} %c MetingJS v1.2.0 %c https://github.com/metowolf/MetingJS ${'\n'}`, 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;');

let aplayers = [];
let loadMeting = () => {
    // 动态获取API地址，支持不同的插件文件夹名称
    let api = '';
    
    if (typeof meting_api !== 'undefined') {
        // 如果已定义 meting_api，优先使用（来自WordPress设置或自定义配置）
        api = meting_api;
    } else if (typeof aplayerPluginUrl !== 'undefined') {
        // 使用WordPress输出的插件URL
        api = aplayerPluginUrl + 'metingapi/wp-api.php?server=:server&type=:type&id=:id&r=:r';
    } else {
        // 降级方案：尝试自动检测插件路径
        const scripts = document.querySelectorAll('script[src*="Meting.js"]');
        if (scripts.length > 0) {
            const scriptSrc = scripts[0].src;
            const pluginPath = scriptSrc.substring(0, scriptSrc.indexOf('/src/Meting.js'));
            api = pluginPath + '/metingapi/wp-api.php?server=:server&type=:type&id=:id&r=:r';
        } else {
            // 最后的降级方案：使用原版官方API（可能不可用）
            api = 'https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r';
            console.warn('APlayer: 无法检测到插件路径，使用默认API（可能不可用）');
        }
    }
    
    // 调试信息
    console.log('APlayer Meting API 初始化:', {
        'API地址': api,
        '检测到的插件URL': typeof aplayerPluginUrl !== 'undefined' ? aplayerPluginUrl : '未定义',
        '自定义API': typeof meting_api !== 'undefined' ? meting_api : '未设置'
    });

    for (let i = 0; i < aplayers.length; i++) {
        if(!aplayers[i].container.classList.contains("no-destroy")){
            try {
                aplayers[i].destroy();
            } catch (e) {
                console.log(e);
            }
        }
    }
    aplayers = [];

    let elements = document.querySelectorAll(".aplayer");

    for (var i = 0; i < elements.length; i++) {
        const el = elements[i];
        if(el.classList.contains("no-reload")) continue;
	if(el.classList.contains("no-destroy")) el.classList.add("no-reload");
        let id = el.dataset.id;
        if (id) {
            let url = el.dataset.api || api;
            url = url.replace(":server", el.dataset.server);
            url = url.replace(":type", el.dataset.type);
            url = url.replace(":id", el.dataset.id);
            url = url.replace(":auth", el.dataset.auth);
            url = url.replace(":r", Math.random());

            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        let response = JSON.parse(xhr.responseText);
                        build(el, response);
                    }
                }
            };
            xhr.open('get', url, true);
            xhr.send(null);

        } else if (el.dataset.url) {
            let data = [{
                name: el.dataset.name || el.dataset.title || 'Audio name',
                artist: el.dataset.artist || el.dataset.author || 'Audio artist',
                url: el.dataset.url,
                cover: el.dataset.cover || el.dataset.pic,
                lrc: el.dataset.lrc,
                type: el.dataset.type || 'auto'
            }];

            build(el, data);
        }
    }

    function build(element, music) {

        let defaultOption = {
            container: element,
            audio: music,
            mini: null,
            fixed: null,
            autoplay: false,
            mutex: true,
            lrcType: 3,
            listFolded: false,
            preload: 'auto',
            theme: '#2980b9',
            loop: 'all',
            order: 'list',
            volume: null,
            listMaxHeight: null,
            customAudioType: null,
            storageName: 'metingjs'
        };

        if (!music.length) {
            return;
        }

        // 预处理音乐数据，处理歌词
        const processedMusic = music.map(track => {
            const processedTrack = {...track};
            
            // 如果 lrc 字段是一个 API 地址，设置为API地址让APlayer异步加载
            if (track.lrc && (track.lrc.includes('api.php') || track.lrc.includes('meting'))) {
                // 保持API地址，让APlayer使用lrcType: 3异步加载
                processedTrack.lrc = track.lrc;
                console.log('设置歌词API地址:', track.name, track.lrc);
            }
            
            return processedTrack;
        });

        // 判断是否需要显示歌词
        const hasLrc = processedMusic.some(track => track.lrc);
        console.log('歌词检测结果:', {
            '有歌词': hasLrc,
            '歌曲数量': processedMusic.length,
            '歌词URLs': processedMusic.map(track => track.lrc).filter(lrc => lrc)
        });
        
        if (hasLrc) {
            // 有歌词时使用lrcType: 3进行异步加载
            defaultOption['lrcType'] = 3;
            console.log('APlayer 歌词模式设置为: lrcType = 3 (异步加载)');
        } else {
            defaultOption['lrcType'] = 0;
            console.log('APlayer 歌词模式设置为: lrcType = 0 (禁用)');
        }

        let options = {};
        for (const defaultKey in defaultOption) {
            let eleKey = defaultKey.toLowerCase();
            if (element.dataset.hasOwnProperty(eleKey) || element.dataset.hasOwnProperty(defaultKey) || defaultOption[defaultKey] !== null) {
                options[defaultKey] = element.dataset[eleKey] || element.dataset[defaultKey] || defaultOption[defaultKey];
                
                // 处理布尔值转换
                if (options[defaultKey] === 'true' || options[defaultKey] === 'false') {
                    options[defaultKey] = (options[defaultKey] == 'true');
                }
                // 处理数值转换，特别是lrcType
                else if (defaultKey === 'lrcType' && typeof options[defaultKey] === 'string') {
                    options[defaultKey] = parseInt(options[defaultKey], 10);
                }
                // 处理其他可能的数值属性
                else if (typeof defaultOption[defaultKey] === 'number' && typeof options[defaultKey] === 'string' && !isNaN(options[defaultKey])) {
                    options[defaultKey] = parseFloat(options[defaultKey]);
                }
            }
        }

        // 使用处理后的音乐数据
        options.audio = processedMusic;

        console.log('APlayer 最终配置:', {
            'lrcType': options.lrcType,
            'lrcType类型': typeof options.lrcType,
            '音频列表': options.audio.map(track => ({
                name: track.name,
                artist: track.artist,
                lrc: track.lrc
            }))
        });

        const player = new APlayer(options);
        
        // 添加播放器事件监听以调试歌词加载
        player.on('loadstart', () => {
            console.log('APlayer: 开始加载音频');
        });
        
        player.on('canplay', () => {
            console.log('APlayer: 音频可以播放');
            if (player.lrc) {
                console.log('APlayer: 歌词实例存在，异步模式:', player.lrc.async);
            }
        });
        
        player.on('play', () => {
            console.log('APlayer: 开始播放，当前歌曲索引:', player.list.index);
            if (player.lrc) {
                console.log('APlayer: 歌词当前状态:', {
                    '已解析歌词': player.lrc.parsed,
                    '当前歌词': player.lrc.current
                });
            }
        });

        aplayers.push(player);
    }
}

document.addEventListener('DOMContentLoaded', loadMeting, false);
