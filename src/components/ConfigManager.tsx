import React, { FC, useEffect, useState } from 'react'
import { useSocketIO } from '../providers'
import { ServerConfig, StyledProp } from '../types'
import styled from 'styled-components'
import QRCode from 'qrcode'

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
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [interfaceKey, setInterfaceKey] = useState('')

  useEffect(() => {
    if (!serverConfig) return

    if (!interfaceKey) {
      const interfaceKeys = Object.keys(serverConfig.networkInterfaces)
      setInterfaceKey(interfaceKeys.includes('en0') ? 'en0' : interfaceKeys[0])
    }
  }, [serverConfig, interfaceKey])

  useEffect(() => {
    if (!serverConfig) return
    if (!interfaceKey) return

    const serverAddress = serverConfig.networkInterfaces[interfaceKey]
      .find(networkInterface => networkInterface.family === 'IPv4')
      ?.address ?? ['']

    const uploadUrl = `http://${serverAddress}:${serverConfig.serverPort}/images`

    QRCode.toDataURL(JSON.stringify({
      pcName: serverConfig.pcName,
      uploadUrl
    })).then(setQrCodeUrl)
  }, [serverConfig, interfaceKey])

  if (!serverConfig) {
    return (
      <div>{'...!'}</div>
    )
  }

  const ipv4NetworkInterfaceKeys = Object.keys(serverConfig.networkInterfaces)
    .filter(key => {
      return serverConfig.networkInterfaces[key].some(networkInterface => networkInterface.family === 'IPv4')
    })

  return (
    <div className={className}>
      <div className="network-config">
        {qrCodeUrl && (
          <img src={qrCodeUrl} />
        )}
        {interfaceKey && (
          <select value={interfaceKey} onChange={e => setInterfaceKey(e.target.value)}>
            {ipv4NetworkInterfaceKeys.map(key => (
              <option value={key} key={key}>
                {key}
              </option>
            ))}
          </select>
        )}
      </div>
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

  .network-config {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

export { StyledConfigManager as ConfigManager }