import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'
import { Router } from 'express'
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
      console.info(`Uploading ${filename}...!`)
      const dataPath = ConfigManager.getDataPath()
      // TODO: Async it
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath)
      }
  
      const filePath = path.join(dataPath, filename)
      const ws = fs.createWriteStream(filePath)

      const deviceDetail = req.jwtPayload

      notifyFileUploadChanged({ filename, progress: 0, filePath, deviceDetail })
  
      file
        .pipe(ws)
        .once('finish', () => {
          console.info(`Uploaded ${filename}...!`)
          notifyFileUploadChanged({ filename, progress: 100, filePath, deviceDetail })
        })
        .once('error', () => {
          console.info(`Failed ${filename}...!`)
          notifyFileUploadChanged({ filename, progress: -1, filePath, deviceDetail })
        })
    })
  
    busboy.once('finish', () => res.sendStatus(201))
  
    req.pipe(busboy)
  })

  return router
}

export { createRouter as imagesRouter }
