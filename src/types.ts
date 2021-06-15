import type os from 'os'

export enum ServerState {
  OFFLINE,
  ONLINE,
}

export type ServerConfig = {
  pcName: string,
  dataPath: string,
  serverPort: number,
  networkInterfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>
}

export type FileUploadProgress = {
  filename: string,
  filePath: string,
  progress: number
}

export type StyledProp = {
  className?: string
}