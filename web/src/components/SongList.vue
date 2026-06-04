<template>
  <div class="song-list">
    <!-- 空态 -->
    <div v-if="!songs.length" class="empty">
      <div class="empty-icon">♪</div>
      <p>{{ hint }}</p>
    </div>

    <!-- 列表头 -->
    <div v-else class="list-header">
      <span class="col-index">#</span>
      <span class="col-name">歌曲</span>
      <span class="col-album">专辑</span>
      <span class="col-dur">时长</span>
    </div>

    <!-- 歌曲行 -->
    <div
      v-for="(song, i) in songs"
      :key="song.id"
      class="song-row"
      :class="{ active: activeSongId === song.id }"
      @click="$emit('play', song)"
    >
      <!-- 序号 / 播放指示 -->
      <span class="col-index">
        <span v-if="activeSongId === song.id" class="playing-bars">
          <i /><i /><i />
        </span>
        <span v-else class="idx">{{ i + 1 }}</span>
      </span>

      <!-- 封面 + 名称 + 歌手 -->
      <span class="col-name">
        <img
          v-if="song.al?.picUrl"
          :src="song.al.picUrl + '?param=48y48'"
          class="cover"
          loading="lazy"
          alt=""
        />
        <span class="name-wrap">
          <span class="song-name">{{ song.name }}</span>
          <span class="song-artist">{{ formatArtists(song.ar) }}</span>
        </span>
      </span>

      <!-- 专辑 -->
      <span class="col-album">{{ song.al?.name ?? '—' }}</span>

      <!-- 时长 -->
      <span class="col-dur">{{ formatDuration(song.dt) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  songs:       { type: Array,  default: () => [] },
  activeSongId:{ type: Number, default: null },
  hint:        { type: String, default: '搜索你喜欢的音乐' },
})
defineEmits(['play'])

function formatArtists(ar) {
  return ar?.map(a => a.name).join(' / ') ?? ''
}
function formatDuration(ms) {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
}
</script>

<style scoped>
.song-list { width: 100%; }

.empty {
  text-align: center;
  padding: 80px 0;
  color: var(--ink-400);
}
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: .3; }
.empty p { font-size: 14px; }

/* 表头 */
.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 180px 60px;
  padding: 0 16px 8px;
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-400);
  border-bottom: 1px solid var(--ink-700);
  margin-bottom: 4px;
}

/* 行 */
.song-row {
  display: grid;
  grid-template-columns: 40px 1fr 180px 60px;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background .15s;
  animation: fadeUp .25s both;
}
.song-row:hover { background: var(--ink-800); }
.song-row.active { background: var(--accent-glow); }
.song-row.active .song-name { color: var(--accent); }

/* 序号列 */
.col-index {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-400);
  display: flex; align-items: center;
}
.idx {}

/* 播放动画条 */
.playing-bars {
  display: flex; align-items: flex-end; gap: 2px; height: 14px;
}
.playing-bars i {
  display: block; width: 3px;
  background: var(--accent);
  border-radius: 2px;
  animation: barBounce .8s ease-in-out infinite;
}
.playing-bars i:nth-child(2) { animation-delay: .15s; }
.playing-bars i:nth-child(3) { animation-delay: .3s; }
@keyframes barBounce {
  0%, 100% { height: 4px; }
  50%       { height: 14px; }
}

/* 名称列 */
.col-name {
  display: flex; align-items: center; gap: 12px; min-width: 0;
}
.cover {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--ink-700);
}
.name-wrap {
  display: flex; flex-direction: column; min-width: 0;
}
.song-name {
  font-size: 14px;
  color: var(--ink-100);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.song-artist {
  font-size: 12px;
  color: var(--ink-400);
  margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 专辑 & 时长 */
.col-album {
  font-size: 13px; color: var(--ink-400);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.col-dur {
  font-family: var(--font-mono);
  font-size: 12px; color: var(--ink-400);
  text-align: right;
}
</style>
