import React, { FC, useEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { UploadDashboard } from './components/UploadDashboard'
import { useSocketIO, SocketIOProvider } from './providers'
import { ServerConfig, ServerState, StyledProp } from './types'

const useServerConfig = () => {
  const [serverConfig, serServerConfig] = useState<ServerConfig>(null)
  const { socket } = useSocketIO()

  useEffect(() => {
    socket.on('@server-config', serServerConfig)
    socket.emit('@server-config')
  }, [])

  return { serverConfig }
}
const useServerState = () => {
  const [serverState, setServerState] = useState(ServerState.OFFLINE)
  const { socket } = useSocketIO()

  useEffect(() => {
    socket.on('connect', () => setServerState(ServerState.ONLINE))
    socket.on('disconnect', () => setServerState(ServerState.OFFLINE))
  }, [])

  return { serverState }
}

const ConfigManager: FC<StyledProp> = ({ className }) => {
  const { serverConfig } = useServerConfig()
  const { socket } = useSocketIO()

  if (!serverConfig) {
    return (
      <div>{'...!'}</div>
    )
  }

  return (
    <div className={className}>
      <label>
        <input
          type="text"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault()
            window.open(`file://${serverConfig.dataPath}`)
          }}
          value={serverConfig.dataPath}
          readOnly
        />
        <button
          onClick={() => {
            socket.emit('@change-data-path')
          }}
        >
          {'Set data path'}
        </button>
      </label>
    </div>
  )
}
const StyledConfigManager = styled(ConfigManager)`
  label {
    display: flex;

    input {
      flex-grow: 1;
    }
  }
`

const App: FC<StyledProp> = ({ className }) => {
  const { serverState } = useServerState()

  return (
    <div className={className}>
      {serverState === ServerState.OFFLINE ? (
        <span>{'API server offline...!'}</span>
      ) : (
        <div>
          <span>{'🚀 API server is running at '}</span>
          <a
            href="http://localhost:8081"
            onClick={e => {
              e.preventDefault()
              window.open('http://localhost:8081')
            }}
          >PORT 8081</a>
          <StyledConfigManager />
          <hr />
          <UploadDashboard />
        </div>
      )}
    </div>
  )
}

const StyledApp = styled(App)`
  padding: 0 0.2rem;
`

const AppWithContexts = () => {
  return (
    <SocketIOProvider>
      <StyledApp />
    </SocketIOProvider>
  )
}

ReactDOM.render(<AppWithContexts />, document.querySelector('#app'))
