import fs from 'fs'
import http from 'http'
import path from 'path'
import * as os from 'os'
import cors from 'cors'
import Busboy from 'busboy'
import express from 'express'
import { dialog } from 'electron'
import { Server, Socket } from 'socket.io'
import { FileUploadProgress, ServerConfig } from './types'

const APP_DATA = path.join(os.homedir(), 'sneaky-uploader')
const CONFIG_PATH = path.join(APP_DATA, 'config.json')

if (!fs.existsSync(APP_DATA)) {
  fs.mkdirSync(APP_DATA)
}

let _config: ServerConfig = null
const ConfigManager = {
  getConfig (): ServerConfig {
    if (_config) return _config

    try {
      const json = fs.readFileSync(CONFIG_PATH, 'utf-8')

      _config = JSON.parse(json)

      return _config
    } catch (error) {
      if (error.code === 'ENOENT') {
        const serverConfig = {
          dataPath: path.join(APP_DATA, 'uploads')
        }

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(serverConfig, null, 2), 'utf-8')

        return serverConfig
      }

      throw error
    }
  },
  setConfig (serverConfig: ServerConfig) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(serverConfig))
    _config = null
  },
  getDataPath () {
    return ConfigManager.getConfig().dataPath
  }
}

export function createServer (): { server: http.Server, setServerConfig (config: ServerConfig): void } {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  })

  app.use(cors())

  app.get('/check-status', (_, res) => {
    res.send({
      code: 200,
      pcName: os.hostname(),
    })
  })

  app.get('/', (_, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sneaky Uploader...!</title>
      </head>
      <body>
        <form action="upload-images" method="POST" enctype="multipart/form-data">
          <input type="file" name="file" id="file" required multiple>
          <button type="submit">Upload</button>
        </form>
      </body>
      </html>
    `)
  })

  app.post('/upload-images', (req, res) => {
    const busboy = new Busboy({ headers: req.headers })

    busboy.on('file', (_fieldname, file, filename) => {
      const filePath = path.join(ConfigManager.getDataPath(), filename)
      const ws = fs.createWriteStream(filePath)

      notifyFileUploadChanged({ filename, progress: 0, filePath })

      file
        .pipe(ws)
        .once('finish', () => {
          notifyFileUploadChanged({ filename, progress: 100, filePath })
        })
        .once('error', () => {
          notifyFileUploadChanged({ filename, progress: -1, filePath })
        })
    })

    busboy.once('finish', () => res.redirect('/'))

    req.pipe(busboy)
  })

  const sockets: Socket[] = []
  const forEachSocket = (fn: (socket: Socket) => void) => {
    sockets.forEach(socket => fn(socket))
  }

  const notifyFileUploadChanged = (fileUploadProgress: FileUploadProgress) => {
    forEachSocket(socket => {
      console.info('@file-upload-changed', `${fileUploadProgress.filename} - ${fileUploadProgress.progress}`)
      socket.emit('@file-upload-changed', fileUploadProgress)
    })
  }
  const notifyConfigChanged = () => {
    forEachSocket(socket => socket.emit('@server-config', ConfigManager.getConfig()))
  }

  io.on('connection', (socket) => {
    sockets.push(socket)

    socket.on('@server-config', notifyConfigChanged)

    socket.on('@change-data-path', async () => {
      try {
        const [dataPath] = await dialog.showOpenDialogSync({
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

  return {
    server,
    setServerConfig (serverConfig: ServerConfig) {
      ConfigManager.setConfig(serverConfig)
    }
  }
}
