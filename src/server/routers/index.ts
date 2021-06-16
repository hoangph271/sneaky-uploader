import { Router } from 'express'

function createRouter (): Router {
  const router = Router()

  router.get('/', (_, res) => {
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
