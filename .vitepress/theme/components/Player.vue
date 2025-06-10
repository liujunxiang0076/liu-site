<!-- 全局播放器 -->
<template>
    <div v-if="playerShow" class="music-player-container">
        <!-- 收起状态的圆形按钮 -->
        <div
            v-if="playerCollapsed"
            class="player-collapsed"
            @mouseenter="handleCollapsedHover"
            @mouseleave="handleCollapsedLeave"
        >
            <div :class="['collapsed-btn', { 'playing-rotate': playState }]" @click="togglePlayerCollapse">
                <div class="album-cover">
                    <img v-if="currentSong?.pic" :src="currentSong.pic" alt="专辑封面" />
                    <i v-else class="iconfont icon-music"></i>
                </div>
                <div class="play-control" @click.stop="togglePlay">
                    <i :class="`iconfont icon-${playState ? 'pause' : 'play'}`"></i>
                </div>
            </div>
            <div class="expand-hint" @click="togglePlayerCollapse">
                <i class="iconfont icon-right"></i>
            </div>
        </div>

        <!-- 展开状态的完整播放器 -->
        <div class="player-expanded" v-show="!playerCollapsed">
            <div class="player-header">
                <span class="player-title">音乐播放器</span>
                <div class="player-controls">
                    <i class="iconfont icon-music" @click="togglePlayerCollapse" title="收起播放器"></i>
                </div>
            </div>
            <div ref="playerDom" class="player-content" />
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { mainStore } from '@/store';
import { getMusicList } from '@/api';
import "aplayer/dist/APlayer.min.css";
import { isClient } from '../utils/helper.mjs'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const store = mainStore();
const { theme } = useData();
const { enable, url, id, server, type } = theme.value.music;
const { playerShow, playerCollapsed, playerVolume, playState, playerData } = storeToRefs(store);

// APlayer
const player = ref(null);
const playerDom = ref(null);
const playlist = ref([]);
const currentIndex = ref(0);

// 播放器状态
const currentSong = ref(null);
const isHoveringCollapsed = ref(false);

// 播放指定歌曲
const playSong = (index) => {
    if (!player.value) return;
    player.value.list.switch(index);
    player.value.play();
    currentIndex.value = index;
};

// 切换播放器收起状态
const togglePlayerCollapse = () => {
    playerCollapsed.value = !playerCollapsed.value;
    console.log('播放器收起状态切换为：', playerCollapsed.value);
};

// 切换播放/暂停
const togglePlay = () => {
    if (!player.value) return;
    console.log('切换播放状态，当前状态：', playState.value);
    player.value.toggle();
};

// 处理收起状态下的鼠标悬停
const handleCollapsedHover = () => {
    isHoveringCollapsed.value = true;
};

const handleCollapsedLeave = () => {
    isHoveringCollapsed.value = false;
};

// 更新当前歌曲信息
const updateCurrentSong = () => {
    if (!player.value || !playlist.value.length) return;
    const current = playlist.value[currentIndex.value];
    if (current) {
        currentSong.value = current;
    }
};

// 获取播放列表
const getMusicListData = async () => {
    try {
        console.log('正在获取音乐列表，API参数：', { url, id, server, type });
        const musicList = await getMusicList(url, id, server, type);
        console.log('获取到的音乐列表：', musicList);
        playlist.value = musicList || [];
        initAPlayer(musicList);
    } catch (error) {
        console.error('获取播放列表失败：', error);
        // 检查$message是否定义
        if (typeof $message !== 'undefined') {
            $message.error('获取播放列表失败，请重试');
        }
        initAPlayer(null);
    }
};

// 初始化播放器
const initAPlayer = async (list) => {
    try {
        if (!list || !list.length) {
            console.warn('播放列表为空，无法初始化播放器');
            return false;
        }
        console.log('正在初始化播放器，播放列表长度：', list.length);

        const module = await import('aplayer');
        const APlayer = module.default;

        player.value = new APlayer({
            // 容器元素 - 播放器容器DOM元素
            container: playerDom.value,

            // 吸底模式 - 开启后播放器会固定在页面底部
            fixed: false,

            // 迷你模式 - 开启后播放器会显示为迷你模式（可能会隐藏某些元素）
            mini: false,

            // 自动播放 - 音频自动播放（注意：大多数浏览器会阻止自动播放）
            autoplay: false,

            // 主题色 - 播放器主题颜色
            theme: '#b7daff',

            // 循环播放 - 音频循环播放模式
            // 可选值: 'all'(列表循环), 'one'(单曲循环), 'none'(不循环)
            loop: 'all',

            // 播放顺序 - 音频播放顺序
            // 可选值: 'list'(列表播放), 'random'(随机播放)
            order: 'list',

            // 预加载 - 音频预加载
            // 可选值: 'none'(不预加载), 'metadata'(预加载元数据), 'auto'(预加载整个音频)
            preload: 'auto',

            // 音量 - 默认音量，范围 0-1
            volume: playerVolume.value,

            // 互斥播放 - 阻止多个播放器同时播放，当前播放器播放时暂停其他播放器
            mutex: true,

            // 列表默认折叠 - 播放列表是否默认折叠
            listFolded: true,

            // 列表最大高度 - 播放列表的最大高度
            listMaxHeight: '200px',

            // 歌词类型 - 歌词显示类型
            // 0: 不显示歌词, 1: 显示歌词但不滚动, 2: 显示歌词并滚动, 3: 显示歌词、滚动并高亮
            lrcType: 3,

            // 本地存储键名 - 用于存储播放器设置的localStorage键名
            storageName: 'aplayer-setting',

            // 播放列表 - 音频文件列表
            audio: list,

        });

        console.info('🎵 播放器挂载完成', player.value);

        // 强制显示aplayer-info元素
        setTimeout(() => {
            const infoElement = playerDom.value?.querySelector('.aplayer-info');
            if (infoElement) {
                infoElement.style.display = 'block';
                console.log('播放器初始化后强制显示aplayer-info元素');
            }
        }, 200);

        // 播放器事件
        player.value?.on('canplay', () => {
            console.log('音乐可以播放，更新信息');
            // 强制显示aplayer-info元素
            setTimeout(() => {
                const infoElement = playerDom.value?.querySelector('.aplayer-info');
                if (infoElement) {
                    infoElement.style.display = 'block';
                    console.log('强制显示aplayer-info元素');
                }
            }, 100);
            // 更新信息
            getMusicData();
            updateCurrentSong();
        });

        // 播放器事件
        player.value?.on('play', () => {
            console.log('开始播放音乐');
            playState.value = true;
            currentIndex.value = player.value.list.index;
            updateCurrentSong();
        });

        player.value?.on('pause', () => {
            console.log('暂停播放音乐');
            playState.value = false;
        });
        //
        player.value?.on('listswitch', (index) => {
            console.log('切换到列表中的第', index, '首歌');
            currentIndex.value = index;
            updateCurrentSong();
        });
        // 
        player.value?.on('error', (e) => {
            console.error('播放器发生错误：', e);
        });

        getMusicData();

        // 挂载播放器
        if (isClient) {
            window.$player = player.value;
            // 添加全局测试方法
            window.$togglePlayerCollapse = togglePlayerCollapse;
        }

        return true;
    } catch (error) {
        console.error('初始化播放器出错：', error);
        return false;
    }
};

// 获取当前播放歌曲信息
const getMusicData = () => {
    try {
        if (!playerDom.value) {
            console.warn('playerDom不存在，无法获取音乐信息');
            return false;
        }

        const songInfo = playerDom.value.querySelector('.aplayer-info');
        if (!songInfo) {
            console.warn('找不到.aplayer-info元素，可能播放器尚未完全加载');
            return false;
        }

        // 歌曲信息
        const titleEl = songInfo.querySelector('.aplayer-title');
        const artistEl = songInfo.querySelector('.aplayer-author');

        if (!titleEl || !artistEl) {
            console.warn('找不到歌曲标题或艺术家元素');
            return false;
        }

        const songName = titleEl.innerText;
        const songArtist = artistEl.innerText.replace(' - ', '');

        console.log('当前播放歌曲信息：', songName, songArtist);

        // 更新信息
        playerData.value = {
            name: songName || '未知曲目',
            artist: songArtist || '未知艺术家'
        };

        // 更新媒体信息
        initMediaSession(playerData.value?.name, playerData.value?.artist);
        return true;
    } catch (error) {
        console.error('获取播放信息出错：', error);
        return false;
    }
};

// 初始化媒体会话控制
const initMediaSession = (title, artist) => {
    if (!isClient) return
    if ('mediaSession' in navigator) {
        // 歌曲信息
        navigator.mediaSession.metadata = new MediaMetadata({ title, artist });
        // 按键关联
        navigator.mediaSession.setActionHandler('play', () => {
            player.value?.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            player.value?.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            player.value?.skipBack();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            player.value?.skipForward();
        });
    }
};

// 监听播放器开启状态
watch(
    () => playerShow.value,
    (val) => {
        if (!val) return false;
        player.value?.destroy();
        getMusicListData();
    }
);

// 监听播放器音量变化
watch(
    () => playerVolume.value,
    (val) => {
        player.value?.volume(val, true);
    }
);

// 监听播放器收起/展开，展开时如有必要重新初始化播放器
watch(
  () => playerCollapsed.value,
  (collapsed) => {
    if (!collapsed && !player.value) {
      // 展开且播放器未初始化，重新初始化
      getMusicListData();
    }
  }
);

onMounted(() => {
    if (!isClient) return;

    console.log('播放器组件挂载，配置：', {
        enable,
        playerShow: playerShow.value,
        windowWidth: window.innerWidth
    });

    // 只有在启用音乐、显示播放器时才初始化
    if (playerShow.value && enable) {
        console.log('符合播放器初始化条件，开始获取音乐列表');
        getMusicListData();
    } else {
        console.log('不满足播放器初始化条件，跳过初始化');
    }
});

onBeforeUnmount(() => {
    player.value?.destroy();
});
</script>

<style lang="scss" scoped>
.music-player-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    margin-top: 10px;

    // 收起状态的圆形按钮
    .player-collapsed {
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        width: fit-content;

        .collapsed-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background-color: var(--main-card-background);
            box-shadow: 0 6px 10px -4px var(--main-dark-shadow);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;

            &.playing-rotate {
                animation: rotate 3s linear infinite;
            }

            .album-cover {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .iconfont {
                    font-size: 20px;
                    color: var(--main-color);
                }
            }

            .play-control {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;

                .iconfont {
                    font-size: 16px;
                    color: white;
                }
            }

            &:hover .play-control {
                opacity: 1;
            }
        }

        .expand-hint {
            margin-left: 8px;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
            background-color: var(--main-card-background);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .iconfont {
                font-size: 12px;
                color: var(--main-color);
            }
        }

        &:hover {
            .collapsed-btn {
                transform: scale(1.05);
                border-color: var(--main-color);
                box-shadow: 0 8px 16px -4px var(--main-dark-shadow);
            }

            .expand-hint {
                opacity: 1;
                transform: translateX(0);
            }
        }
    }

    // 展开状态的完整播放器
    .player-expanded {
        display: flex;
        flex-direction: column;
        background: var(--main-card-background);
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        padding: 0;
        min-width: 320px;
        min-height: 100px;
        .player-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 15px 5px;
            border-bottom: 1px solid var(--main-card-border);
            .player-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--main-font-color);
            }
            .player-controls .iconfont {
                font-size: 18px;
                color: var(--main-font-color);
                cursor: pointer;
                transition: color 0.2s;
                &:hover {
                    color: var(--main-color);
                }
            }
        }
        .player-content {
            min-height: 60px;
            padding: 0 10px 10px 10px;
            box-sizing: border-box;
            display: block;
        }
    }
}

// 旋转动画
@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .music-player-container {
        max-width: 100%;

        .music-list {
            .music-item {
                .music-source {
                    width: 80px;
                }
            }
        }
    }
}
</style>
