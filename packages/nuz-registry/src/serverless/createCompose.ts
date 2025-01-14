import { Express } from 'express'

import Worker from '../classes/Worker'
import onRoute from '../utils/onRoute'

import { ServerlessRoute } from './types'

export const name = 'createCompose'

export const execute: ServerlessRoute = (app: Express, worker: Worker) => {
  app.post(
    '/compose',
    onRoute(async (request, response) => {
      const { authorization: token } = request.headers
      const { data } = request.body

      const formIsMissing = !token || !data
      if (formIsMissing) {
        throw new Error('Form is missing fields')
      }

      const item = await worker.createCompose(token as string, data)

      response.json(item)
      return true
    }),
  )
}
