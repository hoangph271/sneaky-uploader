import HttpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../constants'

import { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from '../../types'
import { jsonRes } from '../responder'

export type ReqWithJwtPayload = { jwtPayload: JwtPayload } & Request

export function jwtVerifier (req: ReqWithJwtPayload, res: Response, next: NextFunction): void {
  const token = (req.cookies.authorization ?? req.headers.authorization ?? '').substring('Bearer '.length)

  if (!token) {
    jsonRes(res, { status: HttpStatus.UNAUTHORIZED })
    return
  }

  jwt.verify(token, JWT_SECRET, (err: Error, payload: JwtPayload) => {
    if (err) {
      console.error(err)
      jsonRes(res, {
        status: HttpStatus.UNAUTHORIZED,
        message: err.message
      })
      return
    }

    if (!payload.deviceId || !payload.deviceName) {
      jsonRes(res, {
        status: HttpStatus.FORBIDDEN,
        message: 'Please provide a JWT with `deviceId` & `deviceName` included'
      })
      return
    }

    req.jwtPayload = payload
    next()
  })
}
