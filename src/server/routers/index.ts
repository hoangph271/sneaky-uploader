import express, { Router } from 'express'
import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../../types'

function createRouter (): Router {
  const router = Router()

  router.get('/sign-out', (_, res) => {
    res.cookie('authorization', '')
    res.redirect('/')
  })

  router.post('/sign-in', express.urlencoded(), (req, res) => {
    const payload: JwtPayload = {
      deviceId: '__root__',
      deviceName: '__root__'
    }

    jwt.sign(payload, req.body.jwt, {
      algorithm: 'HS256'
    }, (err, encoded) => {
      if (err) {
        console.error(err)
        res.sendStatus(httpStatus.UNAUTHORIZED)
        return
      }

      res.cookie('authorization', `Bearer ${encoded}`)
      res.redirect('/')
    })
  })

  router.get('/', (req, res) => {
    if (!req.cookies.authorization) {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sneaky Uploader...!</title>
        </head>
        <body>
          <form action="/sign-in" method="POST" enctype="application/x-www-form-urlencoded">
            <input type="password" name="jwt">
            <button type="submit">Sign in</button>
          </form>
        </body>
        </html>`)
      return
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sneaky Uploader...!</title>
      </head>
      <body>
        <form action="images" method="POST" enctype="multipart/form-data">
          <input type="file" name="file" id="file" required multiple>
          <button type="submit">Upload</button>
          <div>
            <a href="/sign-out">Sign out</a>
          </div>
        </form>
      </body>
      </html>
    `)
  })

  return router
}

export { createRouter as indexRouter }
export { statusRouter } from './status'
export { imagesRouter } from './images'
