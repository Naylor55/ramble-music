
const fs = require('fs')
const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')




function log(msg) {
  const logDir = path.join(app.getPath('userData'), 'logs')
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  const logFile = path.join(logDir, 'app.log')

  // 打印日志路径到 console
  console.log(`[LOG PATH] ${logFile}`)

  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`)
}


// ── 全局调试日志示例 ──────────────────────────────────────
log('========== Electron 启动 ==========')
log(`isPackaged=${app.isPackaged}`)
log(`resourcesPath=${process.resourcesPath}`)

const API_PORT = 3000
let apiProcess = null
let mainWindow = null

// ── 工具：判断是否打包后的环境 ──────────────────────────────────────────────
const isPacked = app.isPackaged

function getResourcePath(...segments) {
  // 打包后资源在 resources/ 目录，开发时在项目根目录
  const base = isPacked
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '..')
  return path.join(base, ...segments)
}

// ── 启动 API 子进程 ──────────────────────────────────────────────────────────
function startApiServer() {
  return new Promise((resolve, reject) => {
    const apiDir = getResourcePath('api-server', 'api-enhanced')
    const appJs = path.join(apiDir, 'app.js')

    // 打包环境用内置 Node，开发环境用系统 Node
    const nodeBin = isPacked
      ? path.join(process.resourcesPath, 'node', 'node.exe')
      : 'node'


    // 打印 spawn 前的路径和存在性
    log(`apiDir=${apiDir}`)
    log(`appJs=${appJs}`)
    log(`nodeBin=${nodeBin}`)
    log(`appExists=${fs.existsSync(appJs)}`)
    log(`nodeExists=${fs.existsSync(nodeBin)}`)


    console.log('[API] 启动目录:', apiDir)
    console.log('[API] Node:', nodeBin)

    apiProcess = spawn(nodeBin, [appJs], {
      cwd: apiDir,
      env: { ...process.env, PORT: String(API_PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    apiProcess.stdout.on('data', (d) => console.log('[API]', d.toString().trim()))
    apiProcess.stderr.on('data', (d) => console.error('[API ERR]', d.toString().trim()))
    apiProcess.on('error', (err) => {
      console.error('[API] 启动失败', err)
      reject(err)
    })

    // 轮询等待 API 服务就绪（最多等 30 秒）
    let tries = 0
    const check = setInterval(() => {
      tries++
      const req = http.get(`http://localhost:${API_PORT}`, (res) => {
        clearInterval(check)
        console.log('[API] 服务就绪')
        resolve()
      })
      req.on('error', () => {
        if (tries >= 60) {
          clearInterval(check)
          reject(new Error('API 服务启动超时'))
        }
      })
      req.end()
    }, 500)
  })
}

// ── 创建主窗口 ───────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    title: '聆 · Music',
    backgroundColor: '#0e0e0f',
    // 先隐藏，等页面加载完再显示，避免白屏闪烁
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 加载编译后的前端
  const indexPath = getResourcePath('web', 'dist', 'index.html')

  // 开发模式加载 Vite dev server，生产模式加载本地文件
  if (!isPacked && process.env.NODE_ENV === 'development') {
    log(`loadURL_from_url:http://localhost:5173`)
    mainWindow.loadURL('http://localhost:5173')
  } else {
    const indexPath = getResourcePath('web', 'dist', 'index.html')
    log('LoadFilr_from_file')
    mainWindow.loadFile(indexPath)
  }

  // 页面就绪后再显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 外部链接用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发模式下打开 DevTools
  if (!isPacked) {
    mainWindow.webContents.openDevTools()
  }
}

// ── 应用生命周期 ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    await startApiServer()
  } catch (e) {
    console.error('API 服务启动失败，继续加载页面（搜索功能将不可用）', e)
  }
  createWindow()
})

app.on('window-all-closed', () => {
  // 关闭窗口时同时杀掉 API 子进程
  if (apiProcess) {
    apiProcess.kill()
    apiProcess = null
  }
  app.quit()
})

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill()
    apiProcess = null
  }
})

