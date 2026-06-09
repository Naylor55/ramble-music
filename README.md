# 聆 · Music

基于 [NeteaseCloudMusicApiEnhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) + Vue 3 + Electron 构建的网易云音乐桌面播放器。

---

## 目录结构

```
music-app/
├── electron/               Electron 主进程
│   ├── main.js             窗口管理 + 后台拉起 API 子进程
│   └── preload.js
├── web/                    Vue 3 前端
│   ├── src/
│   │   ├── api/music.js    所有接口封装
│   │   ├── stores/player.js  播放状态管理（Pinia）
│   │   └── components/
│   │       ├── SearchBar.vue
│   │       ├── SongList.vue
│   │       ├── Player.vue
│   │       └── LoginDialog.vue
│   └── vite.config.js
├── api-server/             NeteaseCloudMusicApiEnhanced（需手动 clone）
│   └── api-enhanced/
├── tools/     node.exe的安装包，打包的时候需要把node运行时打进去
├── build/
│   └── icon.ico            Windows 应用图标（打包用）
├── package.json            根配置，含 Electron-builder 打包设置
└── README.md
```

---

## 开发环境启动

需要同时运行两个服务。

### 前置条件

- Node.js >= 20.20
- 已完成 `api-server/api-enhanced/` 的 clone 和 `npm install`（见下方）

### 第一步：初始化 API 服务（只需一次）

```bash
cd api-server
git clone https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced.git
cd api-enhanced
npm install
```

### 第二步：初始化前端依赖（只需一次）

```bash
cd web
npm install
```

### 第三步：启动

**终端 1 — API 服务：**
```bash
cd api-server/api-enhanced
node app.js
# 看到 "服务器运行在 http://localhost:3000" 说明启动成功
```

**终端 2 — 前端开发服务器：**
```bash
cd web
npm run dev
# 浏览器访问 http://localhost:5173
```

---

## 打包为 Windows 安装包

### 第一步：安装根目录依赖

```bash
# 在 music-app/ 根目录执行
npm install
```

> 首次安装需要下载 Electron 本体（约 100MB），国内网络较慢时先设置镜像：
> ```bash
> npm config set electron_mirror https://npmmirror.com/mirrors/electron/
> npm config set registry https://registry.npmmirror.com
> ```

### 第二步：准备图标（可选）

在 `build/` 目录放一个 `icon.ico`（建议 256×256）。

没有图标时删除 `package.json` 中 `"icon": "build/icon.ico"` 这行也可正常打包。

### 第三步：一键打包

```bash
npm run build
```

该命令依次执行：
1. 编译 Vue 前端 → `web/dist/`
2. 用 electron-builder 打包为 Windows 安装程序

### 第四步：找到产物

```
dist-electron/
└── 聆Music Setup 1.0.0.exe   ← 发给用户安装即可
```

---

## 功能列表

| 功能 | 说明 |
|------|------|
| 🔍 搜索 | 按歌曲名、歌手名搜索，支持加载更多 |
| ▶️ 播放/暂停 | 点击列表任意歌曲开始播放 |
| ⏮ ⏭ 切换 | 上一首 / 下一首 |
| ⏩ 进度跳转 | 点击进度条任意位置跳转 |
| 🔊 音量控制 | 滑动调节音量 / 点击图标静音 |
| 📜 歌词 | 点击播放栏音符按钮展开歌词面板，自动滚动高亮，点击歌词行可跳转 |
| 🖼 封面 | 列表和播放器均显示专辑封面，播放时旋转动画 |

---

## 运行原理

```
用户双击 .exe
    ↓
Electron 主进程（electron/main.js）
    ├── child_process.spawn 拉起 api-server/api-enhanced/app.js
    ├── 轮询 localhost:3000 等待 API 就绪
    └── 加载 web-dist/index.html

Vue 前端
    └── axios → http://localhost:3000 → 网易云服务器
```

API 服务作为子进程在后台静默运行，关闭窗口时自动退出，用户无感知。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面容器 | Electron 30 |
| 前端框架 | Vue 3 + Vite |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| 音乐 API | NeteaseCloudMusicApiEnhanced |
| 打包工具 | electron-builder |

---

## 常见问题

**Q：搜索提示"请确认本地 API 服务已启动"**  
A：确认 `api-server/api-enhanced/` 下的 `node app.js` 正在运行，且端口 3000 未被占用。

**Q：部分歌曲只能听 30 秒**  
A：这是网易云版权限制，未登录状态下有版权保护的歌曲只提供试听片段。登录网易云账号后可解除限制（登录功能开发中）。

**Q：npm install 时 Electron 下载超时**  
A：设置国内镜像后重试：
```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set registry https://registry.npmmirror.com
```

**Q：打包后打开黑屏**  
A：确认 `web/vite.config.js` 中设置了 `base: './'`，然后重新 `npm run build`。

**Q：打包后搜索失败**  
A：进入安装目录 `resources/api-server/api-enhanced/`，确认 `app.js` 和 `node_modules/` 都存在。

**Q：开发时修改前端代码如何热更新**  
A：使用 `cd web && npm run dev` 启动 Vite 开发服务器，修改代码后浏览器自动刷新。打包前执行一次 `npm run build` 编译最新代码。
