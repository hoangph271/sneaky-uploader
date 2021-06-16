import os from 'os'
import { Router } from 'express'

function createRouter (): Router {
  const router = Router()

  router.get('/', (_, res) => {
    res.send({
      code: 200,
      pcName: os.hostname(),
    })
  })

  return router
}

export { createRouter as statusRouter }
