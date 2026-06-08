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
 * 响应示例：
 * 
{
    "album": {
        "publishTime": 1728835200000,
        "size": 38,
        "artist": {
            "img1v1Url": "https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
            "musicSize": 0,
            "albumSize": 0,
            "img1v1": 0,
            "name": "",
            "alias": [],
            "id": 0,
            "picId": 0
        },
        "copyrightId": 0,
        "name": "娃娃公主",
        "id": 250592558,
        "picId": 109951170042159460,
        "mark": 0,
        "status": 1
    },
    "fee": 0,
    "duration": 273504,
    "rtype": 0,
    "ftype": 0,
    "artists": [
        {
            "img1v1Url": "https://p4.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg",
            "musicSize": 0,
            "albumSize": 0,
            "img1v1": 0,
            "name": "让我很悲伤_99",
            "alias": [],
            "id": 53830733,
            "picId": 0
        }
    ],
    "copyrightId": 0,
    "mvid": 0,
    "name": "枫（Cover）",
    "alias": [],
    "id": 2636494127,
    "mark": 128,
    "status": 0
}
 */
export async function searchSongs(keywords, limit = 30, offset = 0) {
  const { data } = await http.get('/search', {
    params: { keywords, limit, offset, type: 1 },
  })
  console.log('[searchSongs]', data)
  if (data.code !== 200) throw new Error('搜索失败')
  return data.result?.songs ?? []
}

/**
 * 获取歌曲播放链接
 * @param {number|string} id   歌曲 ID
 * @param {number}        br   码率，默认 320000
 * 响应示例：
 * {
    "code": 200,
    "data": [
        {
            "id": 2636494127,
            "url": "http://m801.music.126.net/20260608225810/37cb6f64af4503302e478bc21910dddc/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/55768364752/8356/9e77/66a2/b4b511bfde08f3d1da71f68362fff5f7.mp3?vuutv=/x5ZTZv0c6xZ9igvOkg0Ccob852iqqOXXHGgPF/Yo9QR7zFtnz204dsCfAjpN5ZQun7GXA28bLcvz1wYRzPEXoZB4wRzGI4xND/m+mtwnhg=",
            "br": 320000,
            "size": 10943260,
            "md5": "b4b511bfde08f3d1da71f68362fff5f7",
            "code": 200,
            "expi": 1200,
            "type": "mp3",
            "gain": -7.6449,
            "peak": 0.9795,
            "closedGain": -6,
            "closedPeak": 1,
            "fee": 0,
            "uf": null,
            "payed": 0,
            "flag": 1540353,
            "canExtend": false,
            "freeTrialInfo": null,
            "level": "exhigh",
            "encodeType": "mp3",
            "channelLayout": null,
            "freeTrialPrivilege": {
                "resConsumable": false,
                "userConsumable": false,
                "listenType": null,
                "cannotListenReason": null,
                "playReason": null,
                "freeLimitTagType": null
            },
            "freeTimeTrialPrivilege": {
                "resConsumable": false,
                "userConsumable": false,
                "type": 0,
                "remainTime": 0
            },
            "urlSource": 0,
            "rightSource": 0,
            "podcastCtrp": null,
            "effectTypes": null,
            "time": 273504,
            "message": null,
            "levelConfuse": null,
            "musicId": "11578842999",
            "accompany": null,
            "sr": 44100,
            "auEff": null,
            "immerseType": null,
            "beatType": 0
        }
    ]
}
 */
export async function getSongUrl(id, br = 320000) {
  const { data } = await http.get('/song/url', {
    params: { id, br },
  })
  console.log('[getSongUrl]', data)
  if (data.code !== 200) throw new Error('获取播放链接失败')
  return data.data?.[0]?.url ?? null
}

/**
 * 获取歌曲详情（含封面）
 * @param {string} ids  逗号分隔的歌曲 ID，如 "123,456"
 * 响应示例：
 * 
            "name": "枫（Cover）",
            "mainTitle": "枫",
            "additionalTitle": "（Cover）",
            "id": 2636494127,
            "pst": 0,
            "t": 0,
            "ar": [
                {
                    "id": 53830733,
                    "name": "让我很悲伤_99",
                    "tns": [],
                    "alias": []
                }
            ],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "",
            "fee": 0,
            "v": 38,
            "crbt": null,
            "cf": "",
            "al": {
                "id": 250592558,
                "name": "娃娃公主",
                "picUrl": "https://p3.music.126.net/73xfoqBqOsZyCZ_hkNm5dA==/109951170042159459.jpg",
                "tns": [],
                "pic_str": "109951170042159459",
                "pic": 109951170042159460
            },
            "dt": 273504,
            "h": {
                "br": 320000,
                "fid": 0,
                "size": 10943260,
                "vd": -36449,
                "sr": 44100
            },
            "m": {
                "br": 192000,
                "fid": 0,
                "size": 6565973,
                "vd": -33844,
                "sr": 44100
            },
            "l": {
                "br": 128000,
                "fid": 0,
                "size": 4377330,
                "vd": -32116,
                "sr": 44100
            },
            "sq": {
                "br": 837193,
                "fid": 0,
                "size": 28621959,
                "vd": -36631,
                "sr": 44100
            },
            "hr": null,
            "a": null,
            "cd": "01",
            "no": 51,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 0,
            "s_id": 0,
            "mark": 128,
            "originCoverType": 2,
            "originSongSimpleData": {
                "songId": 185912,
                "name": "枫",
                "artists": [
                    {
                        "id": 6452,
                        "name": "周杰伦"
                    }
                ],
                "albumMeta": {
                    "id": 18896,
                    "name": "11月的萧邦"
                }
            },
            "tagPicList": null,
            "resourceState": true,
            "version": 4,
            "songJumpInfo": null,
            "entertainmentTags": null,
            "awardTags": null,
            "displayTags": [],
            "artistClassics": false,
            "markTags": [],
            "songFeature": null,
            "single": 0,
            "noCopyrightRcmd": null,
            "mv": 0,
            "rtype": 0,
            "rurl": null,
            "mst": 9,
            "cp": 0,
            "publishTime": 0
        }
 */
export async function getSongDetail(ids) {
  const { data } = await http.get('/song/detail', { params: { ids } })
  console.log('[getSongDetail]', data)
  if (data.code !== 200) throw new Error('获取详情失败')
  return data.songs ?? []
}

/**
 * 获取 LRC 歌词
 * @param {number|string} id
 * 响应示例：
 * {
    "sgc": false,
    "sfy": false,
    "qfy": false,
    "lrc": {
        "version": 2,
        "lyric": "[00:19.243]烏雲在我們心裏擱下一塊陰影\n[00:26.267]我聆聽沈寂已久的心情\n[00:32.486]清晰透明就像美麗的風景\n[00:39.920]總在回憶裏才看的清\n[00:47.919]被傷透的心能不能夠繼續愛我\n[00:54.909]我用力牽起沒溫度的雙手\n[01:01.027]過往溫柔已經被時間上鎖\n[01:08.318]只剩揮散不去的難過\n[01:16.190]緩緩飄落的楓葉像思念\n[01:21.716]我點燃燭火溫暖歲末的秋天\n[01:28.502]極光掠奪天邊\n[01:32.126]北風掠過想你的容顏\n[01:36.661]我把愛燒成了落葉\n[01:40.082]卻換不回熟悉的那張臉\n[01:44.572]緩緩飄落的楓葉像思念\n[01:49.835]為何挽回要趕在冬天來之前\n[01:56.999]愛你穿越時間\n[02:00.533]兩行來自秋末的眼淚\n[02:05.060]讓愛滲透了地面\n[02:08.597]我要的只是你在我身邊\n[02:27.324]被傷透的心能不能夠繼續愛我\n[02:34.422]我用力牽起沒溫度的雙手\n[02:40.629]過往溫柔已經被時間上鎖\n[02:48.090]只剩揮散不去的難過\n[02:55.532]在山腰間飄逸的紅雨隨著北風雕零\n[03:05.765]我輕輕搖曳風鈴\n[03:09.581]想喚醒被遺棄的愛情\n[03:16.294]雪花已鋪滿了地\n[03:19.740]深怕窗外楓葉已結成冰\n[03:24.302]緩緩飄落的楓葉像思念\n[03:29.619]我點燃燭火溫暖歲末的秋天\n[03:36.709]極光掠奪天邊\n[03:40.317]北風掠過想你的容顏\n[03:44.764]我把愛燒成了落葉\n[03:48.328]卻換不回熟悉的那張臉\n[03:52.727]緩緩飄落的楓葉像思念\n[03:58.064]為何挽回要趕在冬天來之前\n[04:05.227]愛你穿越時間\n[04:08.726]兩行來自秋末的眼淚\n[04:19.326]讓愛滲透了地面\n[04:22.944]我要的只是你在我身邊\n"
    },
    "klyric": {
        "version": 0,
        "lyric": ""
    },
    "tlyric": {
        "version": 0,
        "lyric": ""
    },
    "romalrc": {
        "version": 0,
        "lyric": ""
    },
    "code": 200
}
 */
export async function getLyric(id) {
  const { data } = await http.get('/lyric', { params: { id } })
  console.log('[getLyric]', data)
  if (data.code !== 200) return null
  return data.lrc?.lyric ?? null
}
