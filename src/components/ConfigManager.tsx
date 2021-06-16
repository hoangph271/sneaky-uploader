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
    const qrData = {
      pcName: serverConfig.pcName,
      uploadUrl
    }

    QRCode.toDataURL(JSON.stringify(qrData), { margin: 0 }).then(setQrCodeUrl)
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
      {qrCodeUrl && (
        <img src={qrCodeUrl} />
      )}
      <div className="server-configs">
        <div>
          <span>{'🚀 API server is running at '}</span>
          <a
            href="http://localhost:8081"
            onClick={e => {
              e.preventDefault()

              socket.emit('@open-upload-page')
            }}
          >PORT 8081</a>
        </div>
        {interfaceKey && (
          <select value={interfaceKey} onChange={e => setInterfaceKey(e.target.value)}>
            {ipv4NetworkInterfaceKeys.map(key => (
              <option value={key} key={key}>
                {key}
              </option>
            ))}
          </select>
        )}
      <label>
        <input
          type="text"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault()
            socket.emit('@open-data-path')
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
    </div>
  )
}
const StyledConfigManager = styled(ConfigManager)`
  display: flex;
  margin: 0.4rem;
  gap: 0.4rem;
  width: calc(100% - 0.8rem);

  .server-configs {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: baseline;

    label {
      display: flex;
      width: 100%;

      input {
        flex-grow: 1;
        cursor: pointer;
      }
    }
  }
`

export { StyledConfigManager as ConfigManager }