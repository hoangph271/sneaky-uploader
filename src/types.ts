export enum ServerState {
  OFFLINE,
  ONLINE,
}

export type ServerConfig = {
  dataPath: string
}

export type FileUploadProgress = {
  filename: string,
  progress: number
}
