import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'
import http from 'http'
import https from 'https'
import express, { Router } from 'express'
import HttpStatus from 'http-status'
import { ConfigManager } from '../config-manager'
import { FileUploadProgress, JwtPayload } from '../../types'
import { Socket } from 'socket.io'
import { jwtVerifier, ReqWithJwtPayload } from '../middlewares'
import { jsonRes } from '../responder'

type createRouterParams = {
  toAllSockets(fn: (socket: Socket) => void): void
}
function createRouter (createRouterParams: createRouterParams): Router {
  const { toAllSockets } = createRouterParams
  const router = Router()

  router.post('/url', jwtVerifier, express.urlencoded(), (req: ReqWithJwtPayload, res) => {
    const url = req.body.url as string
    let requestor

    if (url.startsWith('https')) {
      requestor = https.get
    } else if(url.startsWith('http')) {
      requestor = http.get
    } else {
      return res.redirect('/')
    }

    requestor(url, (res) => {
      const contentDisposition = res.headers['content-disposition']
      
      const filename = contentDisposition
        ? contentDisposition.substring(contentDisposition.indexOf('filename="') + 'filename="'.length, contentDisposition.length - 1)
        : encodeURIComponent(path.basename(url))
      const filePath = prepareFilePath(req.jwtPayload, path.normalize(filename))

      res
        .pipe(fs.createWriteStream(filePath))
        .once('open', () => {
          notifyFileUploadChanged({ filename, filePath, progress: 0, deviceDetail: req.jwtPayload })
        })
        .once('finish', () => {
          notifyFileUploadChanged({ filename, filePath, progress: 100, deviceDetail: req.jwtPayload })
        })
    })

    res.redirect('/')
  })

  const prepareFilePath = (deviceDetail: JwtPayload, filename: string) => {
    const dataPath = ConfigManager.getDataPath()

    // TODO: Async it, or use a fs watcher
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)

    const userDir = path.join(dataPath, deviceDetail.deviceId)
    const filePath = path.join(userDir, filename)

    // TODO: Async it, or use a fs watcher
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir)

    return filePath
  }
  const notifyFileUploadChanged = (fileUploadProgress: FileUploadProgress) => {
    toAllSockets(socket => {
      socket.emit('@file-upload-changed', fileUploadProgress)
    })
  }

  router.post('/', jwtVerifier, (req: ReqWithJwtPayload, res) => {
    const busboy = new Busboy({ headers: req.headers })

    busboy.on('file', (_fieldname, file, filename) => {
      const deviceDetail = req.jwtPayload
      const filePath = prepareFilePath(deviceDetail, filename)

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
  
    busboy.once('finish', () => {
      jsonRes(res, {
        status: HttpStatus.CREATED
      })
    })
  
    req.pipe(busboy)
  })

  return router
}

export { createRouter as imagesRouter }
