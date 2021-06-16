import HttpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants'

import type { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from '../../types'

export type ReqWithJwtPayload = { jwtPayload: JwtPayload } & Request

export function jwtVerifier (req: ReqWithJwtPayload, res: Response, next: NextFunction): void {
  const token = (req.headers.authorization ?? '').substring('Bearer '.length)

  if (!token) {
    res.sendStatus(HttpStatus.UNAUTHORIZED)
    return
  }

  jwt.verify(token, JWT_SECRET, (err, payload: JwtPayload) => {
    if (err) {
      console.error(err)
      res
        .status(HttpStatus.UNAUTHORIZED)
        .send(err.message)
      return
    }

    if (!payload.deviceId || !payload.deviceName) {
      res
        .status(HttpStatus.FORBIDDEN)
        .send('Please provide a JWT with `deviceId` & `deviceName` included')
      return
    }

    req.jwtPayload = payload
    next()
  })
}
