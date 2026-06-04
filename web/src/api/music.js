/**
 * music.js — 网易云音乐接口封装
 * - 开发模式（npm run dev）：走 /netease 前缀，由 Vite proxy 转发到 localhost:3000
 * - Electron 打包模式：直接请求 http://localhost:3000
 */
import axios from 'axios'

// window.location.protocol 为 file: 时说明是 Electron 加载的本地文件
const isElectron = window.location.protocol === 'file:'
const BASE = isElectron ? 'http://localhost:3000' : '/netease'

const http = axios.create({
  baseURL: BASE,
  timeout: 15000,
})

/**
 * 搜索歌曲
 * @param {string} keywords  关键词（歌名 / 歌手）
 * @param {number} limit     每页数量
 * @param {number} offset    偏移量
 */
export async function searchSongs(keywords, limit = 30, offset = 0) {
  const { data } = await http.get('/search', {
    params: { keywords, limit, offset, type: 1 },
  })
  if (data.code !== 200) throw new Error('搜索失败')
  return data.result?.songs ?? []
}

/**
 * 获取歌曲播放链接
 * @param {number|string} id   歌曲 ID
 * @param {number}        br   码率，默认 320000
 */
export async function getSongUrl(id, br = 320000) {
  const { data } = await http.get('/song/url', {
    params: { id, br },
  })
  if (data.code !== 200) throw new Error('获取播放链接失败')
  return data.data?.[0]?.url ?? null
}

/**
 * 获取歌曲详情（含封面）
 * @param {string} ids  逗号分隔的歌曲 ID，如 "123,456"
 */
export async function getSongDetail(ids) {
  const { data } = await http.get('/song/detail', { params: { ids } })
  if (data.code !== 200) throw new Error('获取详情失败')
  return data.songs ?? []
}

/**
 * 获取 LRC 歌词
 * @param {number|string} id
 */
export async function getLyric(id) {
  const { data } = await http.get('/lyric', { params: { id } })
  if (data.code !== 200) return null
  return data.lrc?.lyric ?? null
}
