import { Express } from 'express'

import { CollaboratorTypes } from '../types'

import Worker from '../classes/Worker'
import * as collaboratorTypesHelpers from '../utils/collaboratorTypesHelpers'
import onRoute from '../utils/onRoute'

import { ServerlessRoute } from './types'

export const name = 'addCollaboratorToScope'

export const execute: ServerlessRoute = (app: Express, worker: Worker) => {
  app.post(
    '/scope/collaborator',
    onRoute(async (request, response) => {
      const { authorization: token } = request.headers
      const { scope, collaborator } = request.body

      const formIsMissing = !token || !scope || !collaborator
      if (formIsMissing) {
        throw new Error('Form is missing fields')
      }

      const collaboratorIsInvalid =
        !collaboratorTypesHelpers.validate(collaborator.type) ||
        !collaborator.id
      if (collaboratorIsInvalid) {
        throw new Error('Collaborator is invalid')
      }

      const item = await worker.addCollaboratorToScope(token as string, scope, {
        id: collaborator.id,
        type: collaborator.type as CollaboratorTypes,
      })

      response.json(item)
      return true
    }),
  )
}
