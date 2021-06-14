import fs from 'fs'
import http from 'http'
import path from 'path'
import * as os from 'os'
import cors from 'cors'
import express from 'express'
import { dialog } from 'electron'
import { Server } from 'socket.io'
import { ServerConfig } from './types'

const APP_DATA = path.join(os.homedir(), 'sneaky-uploader')
const CONFIG_PATH = path.join(APP_DATA, 'config.json')

if (!fs.existsSync(APP_DATA)) {
  fs.mkdirSync(APP_DATA)
}

const ConfigManager = {
  getConfig (): ServerConfig {
    try {
      const json = fs.readFileSync(CONFIG_PATH, 'utf-8')

      return JSON.parse(json)
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

  io.on('connection', (socket) => {
    const notifyConfigChanged = () => {
      socket.emit('@server-config', ConfigManager.getConfig())
    }

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
