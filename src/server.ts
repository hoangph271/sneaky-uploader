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
const defaultDataPath = path.join(os.homedir(), 'Pictures')


const SERVER_PORT = parseInt(process.env.SERVER_PORT || '8081', 10)

if (!fs.existsSync(APP_DATA)) {
  fs.mkdirSync(APP_DATA)
}

function appendNetworkConfigs (config: ServerConfig): ServerConfig {
  return {
    ...config,
    pcName: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    serverPort: SERVER_PORT
  }
}
let _config: ServerConfig = null
const ConfigManager = {
  getConfig (): ServerConfig {
    if (_config) return appendNetworkConfigs(_config)

    try {
      const json = fs.readFileSync(CONFIG_PATH, 'utf-8')

      _config = JSON.parse(json)

      return appendNetworkConfigs(_config)
    } catch (error) {
      if (error.code === 'ENOENT') {
        const serverConfig = {
          dataPath: defaultDataPath
        }

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(serverConfig, null, 2), 'utf-8')

        return appendNetworkConfigs(serverConfig as ServerConfig)
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

export function startServer (): void {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  })

  app.use(cors())

  app.get('/status', (_, res) => {
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

  app.post('/images', (req, res) => {
    const busboy = new Busboy({ headers: req.headers })

    busboy.on('file', (_fieldname, file, filename) => {
      console.info(`Uploading ${filename}...!`)
      const dataPath = ConfigManager.getDataPath()
      // TODO: Async it
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath)
      }

      const filePath = path.join(dataPath, filename)
      const ws = fs.createWriteStream(filePath)

      notifyFileUploadChanged({ filename, progress: 0, filePath })

      file
        .pipe(ws)
        .once('finish', () => {
          console.info(`Uploaded ${filename}...!`)
          notifyFileUploadChanged({ filename, progress: 100, filePath })
        })
        .once('error', () => {
          console.info(`Failed ${filename}...!`)
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

  server.listen(SERVER_PORT)
}
