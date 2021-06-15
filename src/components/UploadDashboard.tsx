import React, { useState, useEffect, FC } from 'react'
import { FileUploadProgress, StyledProp } from '../types'
import styled from 'styled-components'
import { useSocketIO } from '../providers'

const useFileUploads = () => {
  const [fileUploads, setFileUploads] = useState(new Map<string, FileUploadProgress>())
  const { socket } = useSocketIO()

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

export { StyledUploadDashboard as UploadDashboard }
