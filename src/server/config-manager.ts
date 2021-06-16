import path from 'path'
import os from 'os'
import fs from 'fs'
import { ServerConfig } from '../types'
import { SERVER_PORT } from './constants'

const APP_DATA = path.join(os.homedir(), 'sneaky-uploader')
const CONFIG_PATH = path.join(APP_DATA, 'config.json')
const defaultDataPath = path.join(os.homedir(), 'Pictures')

function appendNetworkConfigs (config: ServerConfig): ServerConfig {
  return {
    ...config,
    pcName: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    serverPort: SERVER_PORT
  }
}
let _config: ServerConfig = null
export const ConfigManager = {
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
  setConfig (serverConfig: ServerConfig): void {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(serverConfig))
    _config = null
  },
  getDataPath (): string {
    return ConfigManager.getConfig().dataPath
  }
}
