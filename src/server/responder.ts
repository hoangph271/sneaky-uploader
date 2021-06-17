import { Response } from 'express'

type ResBody = {
  status: number
} & any
export function jsonRes(res: Response, body: ResBody): void {
  res.status(body.status).send(body)
}
