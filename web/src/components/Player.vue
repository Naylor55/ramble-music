<template>
  <div class="player-root">
    <!-- 歌词侧边栏 -->
    <Transition name="lyric-slide">
      <div v-if="showLyric" class="lyric-sidebar">
        <!-- 歌曲信息头部 -->
        <div class="lyric-header">
          <img :src="coverUrl" class="lyric-cover" alt="" />
          <div class="lyric-meta">
            <span class="lyric-title">{{ store.currentSong?.name }}</span>
            <span class="lyric-artist">{{ formatArtists(store.currentSong?.ar) }}</span>
          </div>
          <button class="lyric-close" @click="showLyric = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 歌词滚动区 -->
        <div class="lyric-scroll" ref="lyricEl">
          <!-- 无歌词 -->
          <div v-if="!store.parsedLyrics.length" class="lyric-empty">
            <span v-if="store.isLoading">加载中…</span>
            <span v-else>暂无歌词</span>
          </div>

          <!-- 顶部留白，让第一行能滚到中间 -->
          <div class="lyric-spacer" />

          <p
            v-for="(line, i) in store.parsedLyrics"
            :key="i"
            class="lyric-line"
            :class="{
              active:  i === store.activeLyricIdx,
              passed:  i < store.activeLyricIdx,
            }"
            @click="seekToLyric(line.time)"
          >{{ line.text }}</p>

          <div class="lyric-spacer" />
        </div>
      </div>
    </Transition>

    <!-- 播放器底栏 -->
    <div class="player" v-if="store.currentSong">
      <audio
        ref="audioEl"
        :src="store.audioUrl"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onMeta"
        @ended="store.playNext"
        @play="store.isPlaying = true"
        @pause="store.isPlaying = false"
        @waiting="waiting = true"
        @canplay="waiting = false; autoPlay()"
      />

      <!-- 封面 + 信息 -->
      <div class="info">
        <div class="cover-wrap" @click="showLyric = !showLyric">
          <img :src="coverUrl" class="cover" :class="{ spinning: store.isPlaying }" alt="" />
          <div class="cover-overlay">
            <svg viewBox="0 0 24 24" fill="currentColor" class="overlay-icon">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
            </svg>
          </div>
        </div>
        <div class="meta">
          <span class="title">{{ store.currentSong.name }}</span>
          <span class="artist">{{ formatArtists(store.currentSong.ar) }}</span>
        </div>
      </div>

      <!-- 控制区 -->
      <div class="controls">
        <button class="ctrl-btn" @click="store.playPrev" :disabled="!store.hasPrev">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
          </svg>
        </button>

        <button class="ctrl-btn play-btn" @click="togglePlay" :disabled="store.isLoading">
          <span v-if="store.isLoading || waiting" class="spinner-white" />
          <svg v-else-if="store.isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <button class="ctrl-btn" @click="store.playNext" :disabled="!store.hasNext">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6h2v12h-2z"/>
          </svg>
        </button>

        <div class="progress-wrap">
          <span class="time">{{ fmtTime(store.currentTime) }}</span>
          <div class="progress-bar" @click="seek">
            <div class="track">
              <div class="fill" :style="{ width: store.progress * 100 + '%' }" />
              <div class="thumb" :style="{ left: store.progress * 100 + '%' }" />
            </div>
          </div>
          <span class="time">{{ fmtTime(store.duration) }}</span>
        </div>

        <div class="volume-wrap">
          <svg class="vol-icon" viewBox="0 0 24 24" fill="currentColor" @click="toggleMute">
            <path v-if="isMuted" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
            <path v-else d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range" min="0" max="1" step="0.01"
            :value="isMuted ? 0 : store.volume"
            @input="setVolume"
            class="vol-slider"
          />
        </div>

        <!-- 歌词按钮 -->
        <button
          class="ctrl-btn lyric-btn"
          :class="{ on: showLyric }"
          @click="showLyric = !showLyric"
          title="歌词"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '../stores/player.js'

const store     = ref(usePlayerStore())
const audioEl   = ref(null)
const lyricEl   = ref(null)
const waiting   = ref(false)
const showLyric = ref(false)
const isMuted   = ref(false)
const prevVol   = ref(0.8)

const coverUrl = computed(() => {
  const pic = store.value.currentSong?._picUrl
    ?? store.value.currentSong?.al?.picUrl
    ?? ''
  return pic ? `${pic}?param=80y80` : ''
})

function formatArtists(ar) {
  return ar?.map(a => a.name).join(' / ') ?? ''
}
function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function autoPlay() {
  if (audioEl.value && store.value.audioUrl) {
    audioEl.value.volume = store.value.volume
    audioEl.value.play().catch(() => {})
  }
}

function togglePlay() {
  if (!audioEl.value || !store.value.audioUrl) return
  store.value.isPlaying ? audioEl.value.pause() : audioEl.value.play()
}

function onTimeUpdate() {
  if (!audioEl.value) return
  store.value.currentTime = audioEl.value.currentTime
  store.value.updateActiveLyric(audioEl.value.currentTime)
  scrollLyric()
}
function onMeta() {
  store.value.duration = audioEl.value?.duration ?? 0
}

function seek(e) {
  if (!audioEl.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  audioEl.value.currentTime = ((e.clientX - rect.left) / rect.width) * store.value.duration
}

// 点击歌词行跳转
function seekToLyric(time) {
  if (audioEl.value) audioEl.value.currentTime = time
}

function setVolume(e) {
  const v = parseFloat(e.target.value)
  store.value.volume = v
  if (audioEl.value) audioEl.value.volume = v
  isMuted.value = v === 0
}
function toggleMute() {
  if (isMuted.value) {
    isMuted.value = false
    store.value.volume = prevVol.value
    if (audioEl.value) audioEl.value.volume = prevVol.value
  } else {
    prevVol.value = store.value.volume
    isMuted.value = true
    if (audioEl.value) audioEl.value.volume = 0
  }
}

// 歌词自动滚动 — 让当前行保持在容器中央
function scrollLyric() {
  if (!lyricEl.value || store.value.activeLyricIdx < 0) return
  const lines = lyricEl.value.querySelectorAll('.lyric-line')
  const active = lines[store.value.activeLyricIdx]
  if (!active) return
  const container = lyricEl.value
  const targetScrollTop = active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2
  container.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
}

watch(() => store.value.audioUrl, (url) => {
  if (audioEl.value) {
    audioEl.value.src = url || ''
    if (url) audioEl.value.load()
  }
})
</script>

<style scoped>
.player-root { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; }

/* ── 歌词侧边栏 ─────────────────────────────────────────────────────────── */
.lyric-sidebar {
  position: absolute;
  bottom: 80px; right: 0;
  width: 320px;
  height: 480px;
  background: rgba(14,14,15,.97);
  border: 1px solid var(--ink-700);
  border-bottom: none;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(24px);
}

.lyric-slide-enter-active,
.lyric-slide-leave-active {
  transition: transform .3s cubic-bezier(.4,0,.2,1), opacity .3s;
}
.lyric-slide-enter-from,
.lyric-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* 侧边栏头部 */
.lyric-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--ink-700);
  flex-shrink: 0;
}
.lyric-cover {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--ink-700);
}
.lyric-meta {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
}
.lyric-title {
  font-size: 13px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lyric-artist {
  font-size: 11px; color: var(--ink-400); margin-top: 2px;
}
.lyric-close {
  background: none; border: none; cursor: pointer;
  color: var(--ink-400); padding: 4px;
  display: flex; align-items: center;
  transition: color .15s; flex-shrink: 0;
}
.lyric-close:hover { color: var(--ink-100); }
.lyric-close svg { width: 16px; height: 16px; }

/* 歌词滚动区 */
.lyric-scroll {
  flex: 1; overflow-y: auto;
  scroll-behavior: smooth;
}
.lyric-scroll::-webkit-scrollbar { width: 3px; }
.lyric-scroll::-webkit-scrollbar-thumb { background: var(--ink-600); border-radius: 2px; }

.lyric-spacer { height: 160px; flex-shrink: 0; }

.lyric-empty {
  height: 100%; display: flex;
  align-items: center; justify-content: center;
  color: var(--ink-400); font-size: 13px;
  padding: 40px 0;
}

.lyric-line {
  display: block;
  padding: 7px 24px;
  font-size: 13px;
  color: var(--ink-600);
  line-height: 1.7;
  text-align: center;
  cursor: pointer;
  transition: color .35s, font-size .35s, font-weight .35s;
  border-radius: var(--radius-sm);
}
.lyric-line:hover { color: var(--ink-200); }
.lyric-line.passed { color: var(--ink-500, #555); }
.lyric-line.active {
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
}

/* ── 底部播放条 ─────────────────────────────────────────────────────────── */
.player {
  height: 80px;
  background: rgba(14,14,15,.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--ink-700);
  display: flex; align-items: center;
  padding: 0 24px; gap: 24px;
}

.info {
  display: flex; align-items: center; gap: 12px;
  width: 220px; flex-shrink: 0;
}
.cover-wrap {
  position: relative; cursor: pointer; flex-shrink: 0;
  width: 48px; height: 48px;
}
.cover {
  width: 48px; height: 48px;
  border-radius: 50%; object-fit: cover;
  background: var(--ink-700);
}
.cover.spinning { animation: rotate 8s linear infinite; }
@keyframes rotate { to { transform: rotate(360deg); } }
.cover-overlay {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s;
}
.cover-wrap:hover .cover-overlay { opacity: 1; }
.overlay-icon { width: 18px; height: 18px; color: var(--accent); }

.meta { display: flex; flex-direction: column; min-width: 0; }
.title {
  font-size: 14px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.artist { font-size: 12px; color: var(--ink-400); margin-top: 2px; }

.controls {
  flex: 1; display: flex; align-items: center; gap: 12px;
}

.ctrl-btn {
  background: none; border: none; cursor: pointer;
  color: var(--ink-200);
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50%;
  transition: color .15s, background .15s;
  flex-shrink: 0;
}
.ctrl-btn:hover:not(:disabled) { color: #fff; background: var(--ink-700); }
.ctrl-btn:disabled { opacity: .3; cursor: not-allowed; }
.ctrl-btn svg { width: 22px; height: 22px; }

.play-btn {
  width: 44px; height: 44px;
  background: var(--accent); color: var(--ink-900);
}
.play-btn:hover:not(:disabled) { background: #d4b47a; }
.play-btn svg { width: 24px; height: 24px; }

.lyric-btn.on { color: var(--accent); }

.progress-wrap {
  flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0;
}
.time { font-family: var(--font-mono); font-size: 11px; color: var(--ink-400); flex-shrink: 0; }
.progress-bar { flex: 1; padding: 10px 0; cursor: pointer; }
.track { position: relative; height: 3px; background: var(--ink-600); border-radius: 2px; }
.fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent); border-radius: 2px;
  transition: width .1s linear;
}
.thumb {
  position: absolute; top: 50%;
  width: 10px; height: 10px;
  background: #fff; border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0; transition: opacity .15s;
}
.progress-bar:hover .thumb { opacity: 1; }

.volume-wrap {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0; width: 130px;
}
.vol-icon { width: 20px; height: 20px; color: var(--ink-400); cursor: pointer; flex-shrink: 0; }
.vol-slider {
  flex: 1; -webkit-appearance: none; appearance: none;
  height: 3px; background: var(--ink-600); border-radius: 2px; cursor: pointer;
  accent-color: var(--accent);
}

.spinner-white {
  width: 18px; height: 18px;
  border: 2px solid rgba(0,0,0,.2);
  border-top-color: var(--ink-900);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  display: block;
}
</style>
