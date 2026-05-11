"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 900,
        height: 640,
        minWidth: 800,
        minHeight: 560,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        skipTaskbar: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../../dist/index.html'));
    }
    mainWindow.on('closed', () => { mainWindow = null; });
}
// === IPC ===
electron_1.ipcMain.handle('select-directory', async () => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    return result.canceled ? null : result.filePaths[0];
});
electron_1.ipcMain.handle('read-file', async (_event, filePath) => {
    try {
        if (!fs_1.default.existsSync(filePath))
            return null;
        return fs_1.default.readFileSync(filePath, 'utf-8');
    }
    catch {
        return null;
    }
});
electron_1.ipcMain.handle('write-file', async (_event, filePath, content) => {
    try {
        const dir = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    catch {
        return false;
    }
});
electron_1.ipcMain.handle('file-exists', async (_event, filePath) => fs_1.default.existsSync(filePath));
electron_1.ipcMain.handle('minimize-window', () => mainWindow?.minimize());
electron_1.ipcMain.handle('close-window', () => mainWindow?.close());
// === 生命周期 ===
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => { if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow(); });
});
electron_1.app.on('window-all-closed', () => { if (process.platform !== 'darwin')
    electron_1.app.quit(); });
