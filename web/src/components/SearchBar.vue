<template>
  <div class="search-wrap">
    <div class="search-box" :class="{ focused }">
      <!-- 搜索图标 -->
      <svg class="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="7"/>
        <line x1="16.5" y1="16.5" x2="22" y2="22"/>
      </svg>

      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        placeholder="搜歌名 · 歌手名 · 专辑"
        @focus="focused = true"
        @blur="focused = false"
        @keydown.enter="doSearch"
      />

      <!-- 清除 -->
      <button v-if="keyword" class="btn-clear" @click="keyword = ''; $emit('clear')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <button class="btn-search" @click="doSearch" :disabled="loading">
        <span v-if="loading" class="spinner" />
        <span v-else>搜索</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ loading: Boolean })
const emit  = defineEmits(['search', 'clear'])

const keyword = ref('')
const focused = ref(false)
const inputRef = ref(null)

function doSearch() {
  if (!keyword.value.trim()) return
  emit('search', keyword.value.trim())
}
</script>

<style scoped>
.search-wrap {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-lg);
  padding: 0 6px 0 16px;
  transition: border-color .2s, box-shadow .2s;
}
.search-box.focused {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.icon-search {
  width: 18px; height: 18px;
  color: var(--ink-400);
  flex-shrink: 0;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--ink-100);
  padding: 14px 0;
  caret-color: var(--accent);
}
input::placeholder { color: var(--ink-400); }

.btn-clear {
  background: none; border: none; cursor: pointer;
  color: var(--ink-400); padding: 4px;
  display: flex; align-items: center;
  transition: color .15s;
}
.btn-clear:hover { color: var(--ink-100); }
.btn-clear svg { width: 14px; height: 14px; }

.btn-search {
  background: var(--accent);
  color: var(--ink-900);
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
  min-width: 64px;
  display: flex; align-items: center; justify-content: center;
}
.btn-search:hover:not(:disabled) { opacity: .85; }
.btn-search:disabled { opacity: .5; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--ink-700);
  border-top-color: var(--ink-900);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  display: block;
}
</style>
