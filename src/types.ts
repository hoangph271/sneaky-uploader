export enum ServerState {
  OFFLINE,
  ONLINE,
}

export type ServerConfig = {
  dataPath: string
}

export type FileUploadProgress = {
  filename: string,
  filePath: string,
  progress: number
}

export type StyledProp = {
  className?: string
}