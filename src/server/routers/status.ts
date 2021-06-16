import os from 'os'
import { Router } from 'express'
import HttpStatus from 'http-status'

function createRouter (): Router {
  const router = Router()

  router.get('/', (_, res) => {
    res.send({
      code: HttpStatus.OK,
      pcName: os.hostname(),
    })
  })

  return router
}

export { createRouter as statusRouter }
