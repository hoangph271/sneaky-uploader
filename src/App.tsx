import React, { FC, useEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'
import styled from 'styled-components'
import { FileUploadProgress, ServerConfig, ServerState } from './types'
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

type StyledProp = {
  className?: string
}

const ConfigManager: FC<StyledProp> = ({ className }) => {
  const { serverConfig } = useServerConfig()

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

const useFileUploads = () => {
  const [fileUploads, setFileUploads] = useState(new Map<string, FileUploadProgress>())

  useEffect(() => {
    socket.on('@file-upload-changed', (fileUpload: FileUploadProgress) => setFileUploads(fileUploads => {
      fileUploads.set(fileUpload.filePath, fileUpload)

      return new Map(fileUploads)
    }))
  })

  return {
    fileUploads
  }
}
const UploadDashboard: FC<StyledProp> = ({ className }) => {
  const { fileUploads } = useFileUploads()

  if (!fileUploads.size) {
    return (
      <div>{'No upload...! 🤔'}</div>
    )
  }

  return (
    <ul className={className}>
      {Array.from(fileUploads.keys()).map(filePath => {
        const fileUpload = fileUploads.get(filePath)

        return (
          <li key={filePath}>
            {fileUpload.progress < 0 ? (
              <span>{'❌'}</span>
            ) : (
              <span>{fileUpload.progress === 100 ? '✅' : '⏳'}</span>
            )}
            <span>{'-'}</span>
            <span>
              {fileUpload.filename}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
const StyledUploadDashboard = styled(UploadDashboard)`

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
          <StyledUploadDashboard />
        </div>
      )}
    </div>
  )
}

const StyledApp = styled(App)`
  padding: 0 0.2rem;
`

ReactDOM.render(<StyledApp />, document.querySelector('#app'))
