import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'
import { Router } from 'express'
import HttpStatus from 'http-status'
import { ConfigManager } from '../config-manager'
import { FileUploadProgress } from '../../types'
import { Socket } from 'socket.io'
import { jwtVerifier, ReqWithJwtPayload } from '../middlewares'

type createRouterParams = {
  toAllSockets(fn: (socket: Socket) => void): void
}
function createRouter (createRouterParams: createRouterParams): Router {
  const { toAllSockets } = createRouterParams
  const router = Router()

  router.post('/', jwtVerifier, (req: ReqWithJwtPayload, res) => {
    const busboy = new Busboy({ headers: req.headers })

    const notifyFileUploadChanged = (fileUploadProgress: FileUploadProgress) => {
      toAllSockets(socket => {
        socket.emit('@file-upload-changed', fileUploadProgress)
      })
    }

    busboy.on('file', (_fieldname, file, filename) => {
      const dataPath = ConfigManager.getDataPath()
      const deviceDetail = req.jwtPayload

      // TODO: Async it, or use a fs watcher
      if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)

      const userDir = path.join(dataPath, deviceDetail.deviceId)
      const filePath = path.join(userDir, filename)

      // TODO: Async it, or use a fs watcher
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir)

      const ws = fs.createWriteStream(filePath)

      notifyFileUploadChanged({ filename, progress: 0, filePath, deviceDetail })
      console.info(`Uploading ${filePath}...!`)
  
      file
        .pipe(ws)
        .once('finish', () => {
          console.info(`Uploaded ${filePath}...!`)
          notifyFileUploadChanged({ filename, progress: 100, filePath, deviceDetail })
        })
        .once('error', () => {
          console.info(`Failed ${filePath}...!`)
          notifyFileUploadChanged({ filename, progress: -1, filePath, deviceDetail })
        })
    })
  
    busboy.once('finish', () => res.sendStatus(HttpStatus.CREATED))
  
    req.pipe(busboy)
  })

  return router
}

export { createRouter as imagesRouter }
