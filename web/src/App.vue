<template>
  <div class="layout">
    <!-- 顶栏 -->
    <header class="header">
      <div class="logo">聆<span class="logo-dot">·</span></div>
      <SearchBar :loading="searching" @search="doSearch" @clear="clearResults" />
      <div class="header-right">
        <span v-if="total > 0" class="result-count">
          共 {{ total }} 首
        </span>
      </div>
    </header>

    <!-- 主区域 -->
    <main class="main" :style="{ paddingBottom: store.currentSong ? '96px' : '24px' }">
      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        ⚠ {{ error }}
      </div>

      <SongList
        :songs="songs"
        :active-song-id="store.currentSong?.id"
        :hint="hint"
        @play="playSong"
      />

      <!-- 加载更多 -->
      <div v-if="songs.length && songs.length < total" class="load-more">
        <button @click="loadMore" :disabled="searching">
          {{ searching ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </main>

    <!-- 播放器 -->
    <Player />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from './stores/player.js'
import { searchSongs } from './api/music.js'
import SearchBar from './components/SearchBar.vue'
import SongList  from './components/SongList.vue'
import Player    from './components/Player.vue'

const store     = ref(usePlayerStore())
const songs     = ref([])
const total     = ref(0)
const searching = ref(false)
const error     = ref('')
const lastKw    = ref('')
const page      = ref(0)
const PAGE_SIZE = 30

const hint = computed(() =>
  lastKw.value ? `"${lastKw.value}" 无结果` : '搜索你喜欢的音乐'
)

async function doSearch(kw) {
  if (searching.value) return
  lastKw.value = kw
  page.value   = 0
  songs.value  = []
  total.value  = 0
  error.value  = ''
  searching.value = true
  try {
    const result = await searchSongs(kw, PAGE_SIZE, 0)
    songs.value = result
    // NeteaseCloudMusicApi 的 /search 在 result 里有 songCount
    // 但 v3 版本返回结构可能不同，这里做兼容
    total.value = result.length < PAGE_SIZE ? result.length : 999
    page.value  = 1
  } catch (e) {
    error.value = '搜索失败，请确认本地 API 服务已启动（端口 3000）'
  } finally {
    searching.value = false
  }
}

async function loadMore() {
  if (searching.value) return
  searching.value = true
  try {
    const result = await searchSongs(lastKw.value, PAGE_SIZE, page.value * PAGE_SIZE)
    songs.value.push(...result)
    page.value++
    if (result.length < PAGE_SIZE) total.value = songs.value.length
  } catch (e) {
    error.value = '加载失败'
  } finally {
    searching.value = false
  }
}

function clearResults() {
  songs.value = []
  total.value = 0
  lastKw.value = ''
}

async function playSong(song) {
  store.value.playlist = songs.value
  await store.value.playSong(song)
}
</script>

<style scoped>
.layout {
  display: flex; flex-direction: column;
  min-height: 100vh;
}

/* 顶栏 */
.header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(14,14,15,.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--ink-700);
  padding: 16px 32px;
  display: flex; align-items: center; gap: 24px;
}
.logo {
  font-family: var(--font-serif);
  font-size: 22px; font-weight: 600;
  color: var(--accent);
  flex-shrink: 0; letter-spacing: .05em;
}
.logo-dot { color: var(--ink-400); margin-left: 1px; }

.header-right {
  flex-shrink: 0; width: 80px; text-align: right;
}
.result-count {
  font-family: var(--font-mono);
  font-size: 12px; color: var(--ink-400);
}

/* 主区域 */
.main {
  flex: 1; padding: 24px 32px;
  max-width: 1100px; width: 100%; margin: 0 auto;
}

.error-banner {
  background: rgba(180,60,60,.15);
  border: 1px solid rgba(180,60,60,.3);
  color: #e08080;
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 16px;
}

.load-more {
  text-align: center; padding: 32px 0;
}
.load-more button {
  background: none;
  border: 1px solid var(--ink-600);
  color: var(--ink-400);
  padding: 8px 32px;
  border-radius: var(--radius-lg);
  cursor: pointer; font-family: var(--font-serif);
  font-size: 14px; transition: all .2s;
}
.load-more button:hover:not(:disabled) {
  border-color: var(--accent-dim); color: var(--accent);
}
</style>
