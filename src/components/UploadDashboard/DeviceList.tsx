import React, { FC } from 'react'
import { DeviceDetail, StyledProp } from '../../types'
import styled from 'styled-components'

type DeviceListProps = {
  devices: DeviceDetail[],
  activeId?: string,
  onDeviceClicked (deviceId: string): void
} & StyledProp
const DeviceList: FC<DeviceListProps> = (props) => {
  const { className, devices, activeId, onDeviceClicked } = props

  if (!devices.length) {
    return (
      <div className={`${className} no-device`}>
        {'No device...! 📵'}
      </div>
    )
  }

  return (
    <ul className={className}>
      {devices.map(device => (
        <li
          key={device.deviceId}
          onClick={() => onDeviceClicked(device.deviceId)}
          className={`device-item ${activeId === device.deviceId ? 'active' : ''}`}
        >
          {device.deviceName}
        </li>
      ))}
    </ul>
  )
}

const StyledDeviceList = styled(DeviceList)`
  border-right: 1px solid lightgray;
  min-width: 20ch;
  width: 6rem;
  background-color: lightgray;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;

  &.no-device {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .device-item {
    padding: 0.4rem;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid lightgray;

    &.active {
      font-weight: bold;
      background-color: rgb(247, 247, 247);
    }

    &:first-child {
      border-top-left-radius: 0.4rem;
    }
    &:last-child {
      border-bottom-left-radius: 0.4rem;
    }

    &:hover {
      background-color: rgba(247, 247, 247, 0.521);
    }
  }
`

export { StyledDeviceList as DeviceList }
