import { app, BrowserWindow } from 'electron'
import { createServer } from './server'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string

if (require('electron-squirrel-startup')) {
  app.quit()
}

const SERVER_PORT = parseInt(process.env.SERVER_PORT || '8081', 10)

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({})

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // mainWindow.webContents.openDevTools()

  const { server } = createServer()

  server.listen(SERVER_PORT)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
