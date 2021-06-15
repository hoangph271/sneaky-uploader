import React, { FC, useEffect, useState } from 'react'
import { useSocketIO } from '../providers'
import { ServerConfig, StyledProp } from '../types'
import styled from 'styled-components'

const useServerConfig = () => {
  const [serverConfig, serServerConfig] = useState<ServerConfig>(null)
  const { socket } = useSocketIO()

  useEffect(() => {
    socket.on('@server-config', serServerConfig)
    socket.emit('@server-config')
  }, [])

  return { serverConfig }
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
  width: 100%;
  label {
    display: flex;

    input {
      flex-grow: 1;
    }
  }
`

export { StyledConfigManager as ConfigManager }