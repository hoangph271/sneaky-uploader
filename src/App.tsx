import React, { useEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'
import { ServerConfig, ServerState } from './types'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8081/')

const useServerConfig = () => {
  const [serverConfig, serServerConfig] = useState<ServerConfig>(null)

  useEffect(() => {
    socket.on('@server-config', serServerConfig)
    socket.emit('@server-config')
  }, [])

  return { serverConfig }
}
const useServerState = () => {
  const [serverState, setServerState] = useState(ServerState.OFFLINE)

  useEffect(() => {
    socket.on('connect', () => setServerState(ServerState.ONLINE))
    socket.on('disconnect', () => setServerState(ServerState.OFFLINE))
  }, [])

  return { serverState }
}

const ConfigManager = () => {
  const { serverConfig } = useServerConfig()

  if (!serverConfig) {
    return (
      <div>{'...!'}</div>
    )
  }

  return (
    <div>
      <label>
        <input type="text" value={serverConfig.dataPath} readOnly />
        <button
          onClick={() => {
            socket.emit('@change-data-path')
          }}
        >Set data path</button>
      </label>
    </div>
  )
}
const App = () => {
  const { serverState } = useServerState()

  return (
    <div>
      {serverState === ServerState.OFFLINE ? (
        <span>{'API server offline...!'}</span>
      ) : (
        <div>
          <span>{'API server is running...! 🚀'}</span>
          <ConfigManager />
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))
