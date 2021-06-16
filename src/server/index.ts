import fs from 'fs'
import http from 'http'
import path from 'path'
import * as os from 'os'
import cors from 'cors'
import express from 'express'
import { dialog, shell } from 'electron'
import { Server, Socket } from 'socket.io'
import { SERVER_PORT } from './constants'
import { ConfigManager } from './config-manager'
import * as routers from './routers'

const APP_DATA = path.join(os.homedir(), 'sneaky-uploader')

if (!fs.existsSync(APP_DATA)) {
  fs.mkdirSync(APP_DATA)
}

const sockets: Socket[] = []
const toAllSockets = (fn: (socket: Socket) => void) => {
  sockets.forEach(socket => fn(socket))
}

export function startServer (): void {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  })

  app.use(cors())

  app.use('/', routers.indexRouter())
  app.use('/status', routers.statusRouter())
  app.use('/images', routers.imagesRouter({ toAllSockets }))

  const notifyConfigChanged = () => {
    toAllSockets(socket => socket.emit('@server-config', ConfigManager.getConfig()))
  }

  io.on('connection', (socket) => {
    sockets.push(socket)

    socket
      .on('@server-config', notifyConfigChanged)
      .on('@open-data-path', () => shell.openPath(ConfigManager.getConfig().dataPath))
      .on('@open-upload-page', () => shell.openExternal(`http://localhost:${SERVER_PORT}/`))
      .on('@change-data-path', async () => {
        try {
          const [dataPath] = dialog.showOpenDialogSync({
            properties: [
              'openDirectory'
            ]
          })

          if (!dataPath) return

          ConfigManager.setConfig({
            ...ConfigManager.getConfig(),
            dataPath
          })

          notifyConfigChanged()
        } catch (error) {
          console.error(error)
        }
      })
  })

  server.listen(SERVER_PORT)
}
