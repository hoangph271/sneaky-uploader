import React, { useState, useEffect, FC } from 'react'
import { DeviceDetail, FileUploadProgress, StyledProp } from '../../types'
import styled from 'styled-components'
import { useSocketIO } from '../../providers'
import { UploadList } from './UploadList'
import { DeviceList } from './DeviceList'

const useFileUploads = () => {
  const [fileUploads, setFileUploads] = useState(new Map<string, FileUploadProgress>())
  const [deviceDetails, setDeviceDetails] = useState(new Map<string, DeviceDetail>())
  const { socket } = useSocketIO()

  useEffect(() => {
    socket.on('@file-upload-changed', (fileUpload: FileUploadProgress) => setFileUploads(fileUploads => {
      const { filePath, deviceDetail } = fileUpload
      fileUploads.set(filePath, fileUpload)

      if (!deviceDetails.has(deviceDetail.deviceId)) {
        setDeviceDetails(deviceDetails => {
          deviceDetails.set(deviceDetail.deviceId, deviceDetail)
          return new Map(deviceDetails)
        })
      }

      return new Map(fileUploads)
    }))
  }, [])

  return {
    fileUploads: Array.from(fileUploads.values()),
    deviceDetails: Array.from(deviceDetails.values())
  }
}
const UploadDashboard: FC<StyledProp> = ({ className }) => {
  const { fileUploads, deviceDetails } = useFileUploads()
  const [activeDeviceId, setActiveDeviceId] = useState('')

  useEffect(() => {
    if (deviceDetails.length === 0) return
    if (activeDeviceId) return

    setActiveDeviceId(deviceDetails[0].deviceId)
  }, [deviceDetails, activeDeviceId])

  const fileUploadsByDevice = activeDeviceId
    ? fileUploads.filter((fileUpload) => fileUpload.deviceDetail.deviceId === activeDeviceId)
    : []

  return (
    <div className={className}>
      <DeviceList
        devices={deviceDetails}
        activeId={activeDeviceId}
        onDeviceClicked={setActiveDeviceId}
      />
      <div className="upload-info">
        <div className="upload-count">
          {`Uploaded ${fileUploadsByDevice.length} files(s)...!`}
        </div>
        <UploadList
          fileUploads={fileUploadsByDevice}
        />
      </div>
    </div>
  )
}
const StyledUploadDashboard = styled(UploadDashboard)`
  display: flex;
  flex-grow: 1;
  width: calc(100% - 0.8rem);
  border: 1px solid lightgray;
  border-radius: 0.4rem;
  margin: 0.4rem;
  overflow: auto;

  .upload-info {
    padding: 0.4rem;
    width: 100%;
    display: flex;
    flex-direction: column;

    .upload-count {
      text-align: center;
      border-bottom: 1px solid lightgray;
    }
  }
`

export { StyledUploadDashboard as UploadDashboard }
