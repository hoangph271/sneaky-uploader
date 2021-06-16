import React, { FC, useEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { ConfigManager } from './components/ConfigManager'
import { UploadDashboard } from './components/UploadDashboard'
import { useSocketIO, SocketIOProvider } from './providers'
import { ServerState, StyledProp } from './types'

const useServerState = () => {
  const [serverState, setServerState] = useState(ServerState.OFFLINE)
  const { socket } = useSocketIO()

  useEffect(() => {
    socket.on('connect', () => setServerState(ServerState.ONLINE))
    socket.on('disconnect', () => setServerState(ServerState.OFFLINE))
  }, [])

  return { serverState }
}

const App: FC<StyledProp> = ({ className }) => {
  const { serverState } = useServerState()

  if (serverState === ServerState.OFFLINE) {
    return (
      <span className={`offline-banner ${className}`}>
        {'API server offline...! 🚧'}
      </span>
    )
  }

  return (
    <div className={className}>
      <div className="main-ui">
        <ConfigManager />
        <UploadDashboard />
      </div>
    </div>
  )
}

const StyledApp = styled(App)`
  padding: 0 0.2rem;

  &.offline-banner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .main-ui {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    justify-content: start;
    max-height: 100vh;
    height: 100vh;
  }
`

const AppWithContexts = () => {
  return (
    <SocketIOProvider>
      <StyledApp />
    </SocketIOProvider>
  )
}

ReactDOM.render(<AppWithContexts />, document.querySelector('#app'))
