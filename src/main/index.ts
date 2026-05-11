import { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

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

  // Minimize to tray instead of closing
  mainWindow.on('minimize', (event: any) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.on('close', (event: any) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })
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
  if (tray) { mainWindow?.hide() }
  else { mainWindow?.close(); app.quit() }
})

ipcMain.handle('get-settings', () => getSettings())
ipcMain.handle('save-settings', (_e: any, data: Record<string, any>) => { saveSettings(data); return true })

ipcMain.handle('set-always-on-top', (_e: any, flag: boolean) => {
  if (!mainWindow) return false
  mainWindow.setAlwaysOnTop(false)
  if (flag) { mainWindow.setAlwaysOnTop(true, 'screen-saver'); mainWindow.moveTop() }
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

app.whenReady().then(() => {
  createWindow()
  createTray()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

// Prevent app quit when all windows are closed
app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
})