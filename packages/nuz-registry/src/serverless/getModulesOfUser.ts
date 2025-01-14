import { Express } from 'express'

import Worker from '../classes/Worker'
import onRoute from '../utils/onRoute'

import { ServerlessRoute } from './types'

export const name = 'getModulesOfUser'

export const execute: ServerlessRoute = (app: Express, worker: Worker) => {
  app.get(
    '/user/modules',
    onRoute(async (request, response) => {
      const { user: id } = request.query

      const formIsMissing = !id
      if (formIsMissing) {
        throw new Error('Missing user id to get the modules')
      }
      const result = await worker.getModulesOfUser(id as string)

      response.json({ user: id, modules: result })
      return true
    }),
  )
}
