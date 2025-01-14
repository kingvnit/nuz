import { MODULE_LASTEST_TAG } from '@nuz/shared'
import { versionHelpers } from '@nuz/utils'

import { MONGOOSE_ERROR_CODES } from '../lib/const'
import {
  CollaboratorTypes,
  Models,
  ModuleId,
  PublishModuleData,
  PublishOptions,
  ScopeId,
  UserId,
} from '../types'

import Service from './Service'

class Module extends Service<ModuleId> {
  constructor(readonly Collection: Models['Module']) {
    super(Collection)
  }

  async create(
    userId: UserId,
    moduleId: ModuleId,
    data: PublishModuleData,
    options?: PublishOptions,
  ) {
    const {
      scope,
      version,
      library,
      format,
      resolve,
      files,
      sizes,
      exportsOnly,
      alias,
      details,
    } = data
    const { fallback } = options || {}

    const creator = { type: CollaboratorTypes.creator, id: userId }
    const collaborators = [creator]

    const versionInfo = {
      version,
      library,
      format,
      resolve,
      files,
      sizes,
      exportsOnly,
      alias,
      fallback,
      details,
      publisher: userId,
    }

    const versionId = versionHelpers.encode(versionInfo.version)
    const versions = new Map([[versionId, versionInfo]])
    const tags = new Map([[MODULE_LASTEST_TAG, version]])

    const module = new this.Collection({
      name: moduleId,
      scope,
      collaborators,
      tags,
      versions,
    })
    try {
      await module.save()
    } catch (error) {
      if (error.code === MONGOOSE_ERROR_CODES.UNIQUE_KEY_EXISTED) {
        throw new Error('Module is already existed')
      }

      throw error
    }

    return module
  }

  async addVersion(
    userId: UserId,
    moduleId: ModuleId,
    data: PublishModuleData,
    options?: PublishOptions,
  ) {
    const {
      version,
      library,
      format,
      resolve,
      files,
      sizes,
      exportsOnly,
      alias,
      details,
    } = data
    const { fallback } = options || {}

    const versionInfo = {
      version,
      library,
      format,
      resolve,
      files,
      sizes,
      exportsOnly,
      alias,
      fallback,
      details,
      publisher: userId,
    }

    const versionId = versionHelpers.encode(versionInfo.version)

    await this.Collection.updateOne(
      { _id: moduleId },
      {
        $set: {
          [`versions.${versionId}`]: versionInfo,
          [`tags.${MODULE_LASTEST_TAG}`]: version,
        },
      },
    )

    return { _id: moduleId }
  }

  async setDeprecate(
    id: ModuleId,
    satisfies: string[],
    deprecate: string | null,
  ) {
    const versionIds = satisfies.map((item) => versionHelpers.encode(item))
    const updateFields = versionIds.reduce(
      (acc, versionId) =>
        Object.assign(acc, { [`versions.${versionId}.deprecated`]: deprecate }),
      {},
    )

    const { ok, nModified: mofitied } = await this.Collection.updateOne(
      { _id: id },
      { $set: updateFields },
    )

    if (mofitied === 0) {
      throw new Error('There was an error during the update process')
    }

    return { _id: id, mofitied, ok, versions: satisfies }
  }

  async getAllInScopes(scopeIds: ScopeId[], fields?: any, limit?: number) {
    const result = await this.Collection.find(
      { scope: { $in: scopeIds } },
      fields || { _id: 1 },
      !limit ? { limit: 1 } : { limit },
    )
    return result
  }
}

export const createService = (collection: Models['Module']) =>
  new Module(collection)

export default Module
