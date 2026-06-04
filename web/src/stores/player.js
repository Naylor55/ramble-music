/**
 * stores/player.js — 播放器全局状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSongUrl, getLyric } from '../api/music.js'

export const usePlayerStore = defineStore('player', () => {
  // ── 状态 ──────────────────────────────────────────────────────────────────
  const currentSong   = ref(null)     // 当前歌曲对象
  const playlist      = ref([])       // 当前播放列表（搜索结果）
  const isPlaying     = ref(false)
  const currentTime   = ref(0)
  const duration      = ref(0)
  const volume        = ref(0.8)
  const isLoading     = ref(false)
  const audioUrl      = ref('')
  const lyricText     = ref('')
  const parsedLyrics  = ref([])       // [{time, text}]
  const activeLyricIdx = ref(-1)

  // ── Getters ───────────────────────────────────────────────────────────────
  const progress = computed(() =>
    duration.value > 0 ? currentTime.value / duration.value : 0
  )
  const currentIndex = computed(() =>
    playlist.value.findIndex(s => s.id === currentSong.value?.id)
  )
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < playlist.value.length - 1)

  // ── 歌词解析 ──────────────────────────────────────────────────────────────
  function parseLrc(lrc) {
    if (!lrc) return []
    const lines = lrc.split('\n')
    const result = []
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g
    for (const line of lines) {
      const matches = [...line.matchAll(timeReg)]
      const text = line.replace(timeReg, '').trim()
      if (!text) continue
      for (const m of matches) {
        const time = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3]) / 1000
        result.push({ time, text })
      }
    }
    return result.sort((a, b) => a.time - b.time)
  }

  function updateActiveLyric(t) {
    if (!parsedLyrics.value.length) return
    let idx = parsedLyrics.value.findLastIndex(l => l.time <= t)
    activeLyricIdx.value = idx
  }

  // ── 播放某首歌 ───────────────────────────────────────────────────────────
  async function playSong(song) {
    isLoading.value = true
    currentSong.value = song
    audioUrl.value = ''
    lyricText.value = ''
    parsedLyrics.value = []
    activeLyricIdx.value = -1

    try {
      const [url, lrc] = await Promise.all([
        getSongUrl(song.id),
        getLyric(song.id),
      ])
      audioUrl.value = url || ''
      lyricText.value = lrc || ''
      parsedLyrics.value = parseLrc(lrc)
    } catch (e) {
      console.error('[Player] playSong error', e)
    } finally {
      isLoading.value = false
    }
  }

  function playNext() {
    if (hasNext.value) playSong(playlist.value[currentIndex.value + 1])
  }
  function playPrev() {
    if (hasPrev.value) playSong(playlist.value[currentIndex.value - 1])
  }

  return {
    currentSong, playlist, isPlaying, currentTime, duration,
    volume, isLoading, audioUrl, lyricText, parsedLyrics, activeLyricIdx,
    progress, currentIndex, hasPrev, hasNext,
    playSong, playNext, playPrev, updateActiveLyric,
  }
})
