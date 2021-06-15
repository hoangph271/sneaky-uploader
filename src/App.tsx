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

  return (
    <div className={className}>
      {serverState === ServerState.OFFLINE ? (
        <span>{'API server offline...!'}</span>
      ) : (
        <div className="main-ui">
          <div>
            <span>{'🚀 API server is running at '}</span>
            <a
              href="http://localhost:8081"
              onClick={e => {
                e.preventDefault()
                window.open('http://localhost:8081')
              }}
            >PORT 8081</a>
          </div>
          <ConfigManager />
          <hr />
          <UploadDashboard />
        </div>
      )}
    </div>
  )
}

const StyledApp = styled(App)`
  padding: 0 0.2rem;

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
