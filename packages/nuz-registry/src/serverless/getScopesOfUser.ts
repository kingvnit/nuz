import { Express } from 'express'

import Worker from '../classes/Worker'
import onRoute from '../utils/onRoute'

import { ServerlessRoute } from './types'

export const name = 'getScopesOfUser'

export const execute: ServerlessRoute = (app: Express, worker: Worker) => {
  app.get(
    '/user/scopes',
    onRoute(async (request, response) => {
      const { user: id } = request.query

      const formIsMissing = !id
      if (formIsMissing) {
        throw new Error('Missing user id to get the scopes')
      }
      const result = await worker.getScopesOfUser(id as string)

      response.json({ user: id, scopes: result })
      return true
    }),
  )
}
