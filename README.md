# 聆 · Music

基于 NeteaseCloudMusicApi + Vue3 的网页音乐播放器。

## 目录结构

```
music-app/
├── api-server/     ← NeteaseCloudMusicApi（第三步 clone 到这里）
├── web/            ← Vue3 前端
└── README.md
```

## 启动步骤

### 第一步：启动网易云 API 服务

```bash
# 进入 api-server 目录
cd api-server

# 如果还没 clone，先执行（只需一次）：
git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git .

# 安装依赖（只需一次）
npm install

# 启动服务（默认监听 3000 端口）
node app.js
```

看到 `服务器运行在 http://localhost:3000` 说明启动成功。

可以在浏览器访问 http://localhost:3000/search?keywords=周杰伦 验证。

### 第二步：启动前端

新开一个终端：

```bash
cd web

# 安装依赖（只需一次）
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 http://localhost:5173 即可使用。

## 功能

- 🔍 搜索：按歌名 / 歌手名搜索
- ▶️ 播放：点击列表任意歌曲播放
- ⏮⏭ 上一首 / 下一首
- ⏩ 进度条拖拽跳转
- 🔊 音量调节 / 静音
- 📜 歌词显示（点右下角「词」按钮）
- 📄 加载更多搜索结果

## 常见问题

**Q: 搜索报错 "本地 API 服务已启动"**  
A: 确认 `api-server/` 里的 `node app.js` 正在运行。

**Q: 点击播放没声音**  
A: 部分歌曲需要会员，url 会返回 null。可以换一首试试，或者登录网易云账号（参考 NeteaseCloudMusicApi 文档的 `/login` 接口）。

**Q: 跨域报错**  
A: 确保前端通过 `npm run dev` 启动（走 Vite proxy），不要直接打开 index.html 文件。
# 聆 Music

基于 Electron + Vue + Node.js 开发的桌面音乐播放器。

## 项目结构

```text
music-app
├── api-server                 # 本地 API 服务
│   └── api-enhanced
├── electron                   # Electron 主进程
│   ├── main.js
│   └── preload.js
├── web                        # Vue 前端
│   ├── src
│   └── dist
├── tools
│   └── node.exe               # 打包使用的 Node 运行时
├── package.json
└── README.md
```

---

## 开发环境

### 环境要求

* Node.js 20+
* npm 10+

查看版本：

```bash
node -v
npm -v
```

---

## 安装依赖

根目录：

```bash
npm install
```

前端：

```bash
cd web
npm install
```

后端：

```bash
cd api-server/api-enhanced
npm install
```

---

## 启动前端开发环境

```bash
cd web
npm run dev
```

默认地址：

```text
http://localhost:5173
```

---

## 启动后端服务

```bash
cd api-server/api-enhanced
node app.js
```

默认端口：

```text
3000
```

测试：

```bash
curl http://localhost:3000
```

---

## 启动 Electron

项目根目录：

```bash
npx electron .
```

---

## 打包

```bash
npm run build
```

生成目录：

```text
dist-electron
```

安装包位于：

```text
dist-electron/*.exe
```

---

## Electron 打包说明

项目采用独立 Node Runtime 方案。

打包时会自动包含：

```text
resources
├── api-server
│   └── api-enhanced
└── node
    └── node.exe
```

Electron 启动后会自动拉起本地 API 服务：

```text
http://localhost:3000
```

---

## 日志

运行日志目录：

```text
%APPDATA%\聆Music\logs
```

例如：

```text
C:\Users\<用户名>\AppData\Roaming\聆Music\logs\app.log
```

日志内容包括：

* Electron 启动信息
* API 服务启动日志
* Node Runtime 检查结果
* 异常堆栈信息

---

## 常见问题

### Electron 启动后搜索失败

检查日志：

```text
app.log
```

确认：

```text
nodeExists=true
appExists=true
```

若为：

```text
nodeExists=false
```

说明 Node Runtime 未正确打包。

---

### API 服务无法启动

检查：

```text
resources/api-server/api-enhanced/node_modules
```

是否存在。

缺失时执行：

```bash
cd api-server/api-enhanced
npm install
```

重新打包。

---

## 技术栈

* Electron 30
* Vue 3
* Vite 5
* Node.js 20
* Express
* Axios
