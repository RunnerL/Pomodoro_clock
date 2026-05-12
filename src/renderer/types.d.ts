export {}

declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>
      readFile: (path: string) => Promise<string | null>
      writeFile: (path: string, content: string) => Promise<boolean>
      fileExists: (path: string) => Promise<boolean>
      minimizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      getSettings: () => Promise<Record<string, any>>
      saveSettings: (data: Record<string, any>) => Promise<boolean>
      setAlwaysOnTop: (flag: boolean) => Promise<boolean>
      setWindowOpacity: (opacity: number) => Promise<boolean>
      sendNotification: (title: string, body: string) => Promise<void>
      setMinWidth: (width: number) => Promise<boolean>
      showWindow: () => Promise<void>
      listTodoFiles: (dirPath: string) => Promise<{ dateKey: string; date: string; filename: string }[]>
    }
  }
}