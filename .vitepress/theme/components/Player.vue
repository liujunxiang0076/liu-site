<!-- 全局播放器 -->
<template>
    <div v-if="playerShow" class="music-player-container">
        <div ref="playerDom" class="player-content" />
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
const { playerShow, playerVolume, playState, playerData } = storeToRefs(store);

// APlayer
const player = ref(null);
const playerDom = ref(null);
const playlist = ref([]);
const currentIndex = ref(0);

// 播放指定歌曲
const playSong = (index) => {
    if (!player.value) return;
    player.value.list.switch(index);
    player.value.play();
    currentIndex.value = index;
};

// 获取播放列表
const getMusicListData = async () => {
    try {
        console.log('正在获取音乐列表，API参数：', { url, id, server, type });
        const musicList = await getMusicList(url, id, server, type);
        console.log('获取到的音乐列表：', musicList);
        playlist.value = musicList || [];
        initAPlayer(musicList?.length ? musicList : []);
    } catch (error) {
        console.error('获取播放列表失败：', error);
        // 检查$message是否定义
        if (typeof $message !== 'undefined') {
            $message.error('获取播放列表失败，请重试');
        }
        initAPlayer([]);
    }
};

// 初始化播放器
const initAPlayer = async (list) => {
    try {
        if (!list?.length) {
            console.warn('播放列表为空，无法初始化播放器');
            return false;
        }
        console.log('正在初始化播放器，播放列表长度：', list.length);
        
        const module = await import('aplayer');
        const APlayer = module.default;
        
        player.value = new APlayer({
            container: playerDom.value,
            volume: playerVolume.value,
            lrcType: 3,
            listFolded: false,
            order: 'list',
            audio: list
        });
        
        console.info('🎵 播放器挂载完成', player.value);
        
        // 播放器事件
        player.value?.on('canplay', () => {
            console.log('音乐可以播放，更新信息');
            // 更新信息
            getMusicData();
        });
        
        player.value?.on('play', () => {
            console.log('开始播放音乐');
            playState.value = true;
            currentIndex.value = player.value.list.index;
        });
        
        player.value?.on('pause', () => {
            console.log('暂停播放音乐');
            playState.value = false;
        });
        
        player.value?.on('listswitch', (index) => {
            console.log('切换到列表中的第', index, '首歌');
            currentIndex.value = index;
        });
        
        player.value?.on('error', (e) => {
            console.error('播放器发生错误：', e);
        });
        
        getMusicData();
        
        // 挂载播放器
        if (isClient) {
            window.$player = player.value;
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
    background-color: var(--main-card-background);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .player-content {
        width: 100%;
        height: auto;
        :deep(.aplayer) {
            background-color: transparent;
            margin: 0;
            box-shadow: none;
            
            .aplayer-body {
                padding: 10px;
                background-color: var(--main-color);
                .aplayer-pic {
                    height: 40px;
                    width: 40px;
                }
                .aplayer-info {
                    margin-left: 10px;
                    .aplayer-music {
                        .aplayer-title {
                            color: white;
                        }
                        .aplayer-author {
                            color: rgba(255, 255, 255, 0.8);
                        }
                    }
                    .aplayer-controller {
                        .aplayer-bar-wrap {
                            .aplayer-bar {
                                .aplayer-played {
                                    background: white !important;
                                    .aplayer-thumb {
                                        background: white !important;
                                    }
                                }
                            }
                        }
                        .aplayer-time {
                            .aplayer-icon {
                                path {
                                    fill: white;
                                }
                            }
                            .aplayer-time-inner {
                                color: white;
                            }
                        }
                    }
                }
            }
            .aplayer-list {
                display: none; // 隐藏原始列表
            }
        }
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
