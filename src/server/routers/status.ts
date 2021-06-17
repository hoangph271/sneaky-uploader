import os from 'os'
import { Router } from 'express'
import HttpStatus from 'http-status'
import { jsonRes } from '../responder'

function createRouter (): Router {
  const router = Router()

  router.get('/', (_, res) => {
    jsonRes(res, {
      status: HttpStatus.OK,
      pcName: os.hostname()
    })
  })

  return router
}

export { createRouter as statusRouter }
