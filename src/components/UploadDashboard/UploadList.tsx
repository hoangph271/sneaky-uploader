import React, { FC } from 'react'
import styled from 'styled-components'
import { FileUploadProgress, StyledProp } from '../../types'

type UploadListProps = {
  fileUploads: FileUploadProgress[]
} & StyledProp

const UploadList: FC<UploadListProps> = (props) => {
  const { className, fileUploads } = props

  return (
    <div className={className}>
      <ul>
        {fileUploads.map(fileUpload => {
          return (
            <li key={fileUpload.filePath}>
              {fileUpload.progress < 0 ? (
                <span>{'❌'}</span>
              ) : (
                <span>{fileUpload.progress === 100 ? '✅' : '⏳'}</span>
              )}
              <span className="filename">
                {fileUpload.filename}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const StyledUploadList = styled(UploadList)`
  overflow: auto;
  flex-grow: 1;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: auto;

    li:hover {
      cursor: pointer;

      .filename {
        text-decoration: underline;
      }
    }
  }
`

export { StyledUploadList as UploadList }
