import { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu, nativeImage, screen } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let miniWindow: BrowserWindow | null = null
let tray: Tray | null = null
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

let timerStateCache: { remainingSeconds: number; mode: string; timerState: string; weatherType: string } = {
  remainingSeconds: 0, mode: 'work', timerState: 'idle', weatherType: 'sunny',
}
let appSettingsCache: { alwaysOnTop: boolean } = { alwaysOnTop: true }

if (process.platform === 'win32') app.setAppUserModelId('com.pomodoro.clock')

function getSettings(): Record<string, any> {
  try { if (fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) } catch {}
  return {}
}
function saveSettings(data: Record<string, any>) {
  const existing = getSettings()
  fs.writeFileSync(settingsPath, JSON.stringify({ ...existing, ...data }, null, 2), 'utf-8')
}

function getIconPath(): string {
  const iconFile = path.join(__dirname, '../../public/icon.png')
  if (fs.existsSync(iconFile)) return iconFile
  // fallback: generate a simple icon from data
  const dataPath = path.join(app.getPath('userData'), 'tray-icon.png')
  if (!fs.existsSync(dataPath)) {
    // Create a minimal 16x16 red circle PNG as fallback tray icon
    const { createCanvas } = require('canvas') || {}
    if (!createCanvas) return iconFile
  }
  return iconFile
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '../../public/icon.png')
    if (!fs.existsSync(iconPath)) return

    const icon = nativeImage.createFromPath(iconPath)
    const trayIcon = icon.resize({ width: 16, height: 16 })
    tray = new Tray(trayIcon)
    tray.setToolTip('Pomodoro Clock - 番茄钟')

    const contextMenu = Menu.buildFromTemplate([
      { label: '显示窗口', click: () => { mainWindow?.show(); mainWindow?.focus() } },
      { type: 'separator' },
      { label: '退出', click: () => { app.exit() } },
    ])
    tray.setContextMenu(contextMenu)

    tray.on('double-click', () => {
      mainWindow?.show()
      mainWindow?.focus()
    })
  } catch (e) {
    console.error('Failed to create tray:', e)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900, height: 640,
    minWidth: 300, minHeight: 400,
    frame: false, transparent: true, resizable: true,
    focusable: true, alwaysOnTop: true, skipTaskbar: false,
    backgroundColor: '#00000000', type: 'toolbar',
    icon: path.join(__dirname, '../../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))

  // Minimize → hide to tray + show mini window
  mainWindow.on('minimize', (event: any) => {
    event.preventDefault()
    mainWindow?.hide()
    if (!miniWindow) createMiniWindow('top')
  })

  mainWindow.on('close', (event: any) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })

  }

function createMiniWindow(anchor: 'top' | 'bottom') {
  if (miniWindow) return
  const disp = screen.getPrimaryDisplay()
  const { width: sw, x: sx, y: sy, height: sh } = disp.workArea
  const mw = 280, mh = 68

  miniWindow = new BrowserWindow({
    width: mw, height: mh,
    x: Math.round(sx + (sw - mw) / 2),
    y: anchor === 'top' ? sy : sy + sh - mh,
    frame: false, transparent: true, resizable: false,
    alwaysOnTop: appSettingsCache.alwaysOnTop, skipTaskbar: true,
    focusable: true, type: 'toolbar',
    backgroundColor: '#00000000',
    icon: path.join(__dirname, '../../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  })

  miniWindow.loadFile(path.join(__dirname, '../../dist/index.html'), {
    query: { mini: 'true', anchor },
  })

  miniWindow.on('closed', () => { miniWindow = null })
}

function destroyMiniWindow() {
  if (miniWindow) {
    miniWindow.close()
    miniWindow = null
  }
}

// === IPC ===
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
  return r.canceled ? null : r.filePaths[0]
})
ipcMain.handle('read-file', async (_e: any, fp: string) => {
  try { return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : null } catch { return null }
})
ipcMain.handle('write-file', async (_e: any, fp: string, content: string) => {
  try {
    const d = path.dirname(fp)
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(fp, content, 'utf-8')
    return true
  } catch { return false }
})
ipcMain.handle('file-exists', async (_e: any, fp: string) => fs.existsSync(fp))
ipcMain.handle('minimize-window', () => mainWindow?.minimize())
ipcMain.handle('close-window', () => {
  if (tray) {
    mainWindow?.hide()
    if (!miniWindow) createMiniWindow('top')
  } else { mainWindow?.close(); app.quit() }
})

ipcMain.handle('close-mini-window', () => {
  // Close mini window, app stays in tray
  destroyMiniWindow()
})

ipcMain.handle('get-settings', () => {
  const s = getSettings()
  appSettingsCache.alwaysOnTop = s.alwaysOnTop !== undefined ? s.alwaysOnTop : true
  return s
})
ipcMain.handle('save-settings', (_e: any, data: Record<string, any>) => {
  if (data.alwaysOnTop !== undefined) appSettingsCache.alwaysOnTop = data.alwaysOnTop
  saveSettings(data)
  return true
})

ipcMain.handle('set-always-on-top', (_e: any, flag: boolean) => {
  appSettingsCache.alwaysOnTop = flag
  if (!mainWindow) return false
  mainWindow.setAlwaysOnTop(false)
  if (flag) { mainWindow.setAlwaysOnTop(true, 'screen-saver'); mainWindow.moveTop() }
  if (miniWindow) {
    miniWindow.setAlwaysOnTop(false)
    if (flag) { miniWindow.setAlwaysOnTop(true, 'screen-saver'); miniWindow.moveTop() }
  }
  return true
})
ipcMain.handle('set-window-opacity', (_e: any, opacity: number) => {
  if (mainWindow) { mainWindow.setOpacity(opacity); return true }
  return false
})
ipcMain.handle('send-notification', (_e: any, title: string, body: string) => {
  if (Notification.isSupported()) new Notification({ title, body, silent: false }).show()
})
ipcMain.handle('set-min-width', (_e: any, width: number) => {
  if (mainWindow) { mainWindow.setMinimumSize(width, 400); return true }
  return false
})
ipcMain.handle('show-window', () => {
  mainWindow?.show()
  mainWindow?.focus()
})

ipcMain.handle('list-todo-files', async (_e: any, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath)
    const re = /^工作日志_(\d{2})(\d{2})(\d{2})\.md$/
    const results: { dateKey: string; date: string; filename: string }[] = []
    for (const f of files) {
      const m = f.match(re)
      if (m) {
        const dateKey = m[1] + m[2] + m[3] // yyMMdd
        const year = 2000 + parseInt(m[1], 10)
        results.push({
          dateKey,
          date: `${year}-${m[2]}-${m[3]}`,
          filename: f,
        })
      }
    }
    results.sort((a, b) => b.date.localeCompare(a.date))
    return results
  } catch { return [] }
})

// === Mini window IPC ===
ipcMain.handle('report-timer-state', (_e: any, data: { remainingSeconds: number; mode: string; timerState: string; weatherType: string }) => {
  timerStateCache = data
})

ipcMain.handle('get-timer-state', () => {
  return timerStateCache
})

ipcMain.handle('restore-main-window', () => {
  destroyMiniWindow()
  mainWindow?.show()
  mainWindow?.focus()
})

// Timer control from mini window → relayed to main window
let pendingTimerCommand: string | null = null

ipcMain.handle('mini-timer-command', (_e: any, command: string) => {
  pendingTimerCommand = command
})

ipcMain.handle('get-pending-timer-command', () => {
  const cmd = pendingTimerCommand
  pendingTimerCommand = null
  return cmd
})

// AlwaysOnTop setting for mini window
ipcMain.handle('get-always-on-top-setting', () => {
  return appSettingsCache.alwaysOnTop
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  app.on('activate', () => {
    if (miniWindow) {
      destroyMiniWindow()
    }
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

app.on('before-quit', () => {
  destroyMiniWindow()
})

// Prevent app quit when all windows are closed
app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
})