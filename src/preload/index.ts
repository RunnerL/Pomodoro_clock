import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  selectDirectory: () => ipcRenderer.invoke('select-directory') as Promise<string | null>,
  readFile: (path: string) => ipcRenderer.invoke('read-file', path) as Promise<string | null>,
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content) as Promise<boolean>,
  fileExists: (path: string) => ipcRenderer.invoke('file-exists', path) as Promise<boolean>,
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  getSettings: () => ipcRenderer.invoke('get-settings') as Promise<Record<string, any>>,
  saveSettings: (data: Record<string, any>) => ipcRenderer.invoke('save-settings', data) as Promise<boolean>,
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('set-always-on-top', flag) as Promise<boolean>,
  setWindowOpacity: (opacity: number) => ipcRenderer.invoke('set-window-opacity', opacity) as Promise<boolean>,
  sendNotification: (title: string, body: string) => ipcRenderer.invoke('send-notification', title, body),
  setMinWidth: (width: number) => ipcRenderer.invoke('set-min-width', width),
  showWindow: () => ipcRenderer.invoke('show-window'),
  listTodoFiles: (dirPath: string) => ipcRenderer.invoke('list-todo-files', dirPath) as Promise<{ dateKey: string; date: string; filename: string }[]>,
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
export type ElectronAPI = typeof electronAPI