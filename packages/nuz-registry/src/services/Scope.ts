import { MONGOOSE_ERROR_CODES } from '../lib/const'
import {
  CollaboratorTypes,
  CreateScopeData,
  Models,
  ScopeId,
  UserId,
} from '../types'

import Service from './Service'

class Scope extends Service<ScopeId> {
  constructor(readonly Collection: Models['Scope']) {
    super(Collection)
  }

  async create(userId: UserId, data: CreateScopeData) {
    const { name } = data

    const creator = { type: CollaboratorTypes.creator, id: userId }
    const collaborators = [creator]

    const scope = new this.Collection({ name, collaborators })
    try {
      await scope.save()
    } catch (error) {
      if (error.code === MONGOOSE_ERROR_CODES.UNIQUE_KEY_EXISTED) {
        throw new Error('Scope is already existed')
      }

      throw error
    }

    return scope
  }

  async delete(id: ScopeId) {
    const { ok, deletedCount } = await this.Collection.deleteOne({ _id: id })
    return { _id: id, ok, deleted: deletedCount }
  }
}

export const createService = (collection: Models['Scope']) =>
  new Scope(collection)

export default Scope
