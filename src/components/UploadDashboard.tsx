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
  }, [])

  return {
    fileUploads
  }
}
const UploadDashboard: FC<StyledProp> = ({ className }) => {
  const { fileUploads } = useFileUploads()

  if (!fileUploads.size) {
    return (
      <div
        className={className}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        {'No upload...! 🤔'}
        </div>
    )
  }

  return (
    <div className={className}>
      <div style={{ textAlign: 'center' }}>
        {`Uploaded ${fileUploads.size} files(s)...!`}
      </div>
      <div className="upload-list">
        <ul >
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
      </div>
    </div>
  )
}
const StyledUploadDashboard = styled(UploadDashboard)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: calc(100% - 0.8rem);
  border: 1px solid lightgray;
  border-radius: 0.4rem;
  margin: 0.4rem;

  .upload-list {
    flex-basis: 0;
    flex-grow: 1;
    overflow: auto;
  }
`

export { StyledUploadDashboard as UploadDashboard }
