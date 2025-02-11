import { UserAccessTokenTypes } from '@nuz/shared'
import { pick, tokenTypesHelpers } from '@nuz/utils'
import glob from 'glob'
import os from 'os'
import path from 'path'

import {
  NUZ_AUTH_FILENAME,
  NUZ_CONFIG_FILENAME,
  NUZ_DEFAULT_USERNAME,
  NUZ_USERS_DIR,
} from '../lib/const'

import * as paths from '../paths'
import * as fs from '../utils/fs'
import { info, warn } from '../utils/print'

type ConfigPaths = {
  home: string
  root: string
  nuzrc: string
  config: string
  users: string
  auth: string
}

const pathsFactory = (): ConfigPaths => {
  const home = os.homedir()
  const root = path.join(os.homedir(), '.nuz')
  const nuzrc = path.join(root, '.nuzrc')

  const users = path.join(root, NUZ_USERS_DIR)
  const config = path.join(nuzrc, NUZ_CONFIG_FILENAME)
  const auth = path.join(nuzrc, NUZ_AUTH_FILENAME)

  return {
    home,
    root,
    nuzrc,
    config,
    auth,
    users,
  }
}

export enum ConfigKeys {
  registry = 'registry',
  static = 'static',
}

export interface ConfigData {
  [ConfigKeys.registry]: string
  [ConfigKeys.static]: string
}

export enum AuthKeys {
  id = 'id',
  username = 'username',
  token = 'token',
  type = 'type',
  loggedAt = 'loggedAt',
}

export interface AuthData {
  [AuthKeys.id]: string
  [AuthKeys.username]: string
  [AuthKeys.token]: string
  [AuthKeys.type]: UserAccessTokenTypes
  [AuthKeys.loggedAt]: Date | undefined
}

class Config {
  static readonly paths = pathsFactory()

  /**
   * Make a symlinks to use
   */
  static async use(username: string) {
    const configPath = path.join(this.paths.users, username)
    if (!fs.exists(configPath)) {
      throw new Error(`${username} is not exists in config`)
    }

    await fs.remove(this.paths.nuzrc)
    await fs.symlink(configPath, this.paths.nuzrc)
  }

  /**
   * Create new user in work folder
   */
  static async create(username: string): Promise<boolean> {
    const configPath = path.join(this.paths.users, username)
    if (fs.exists(configPath)) {
      return false
    }

    const defaultPath = path.join(this.paths.users, NUZ_DEFAULT_USERNAME)
    if (!fs.exists(defaultPath)) {
      warn('No default user found, creating new default profile...')
      const defaultTemplatePath = path.join(
        paths.tool + `/templates/root/users/${NUZ_DEFAULT_USERNAME}`,
      )
      await fs.copy(defaultTemplatePath, defaultPath)
    }

    await fs.copy(defaultPath, configPath)
    return true
  }

  /**
   * Delete a user in work folder
   */
  static async delete(username: string): Promise<boolean> {
    const configPath = path.join(this.paths.users, username)
    if (!fs.exists(configPath)) {
      return false
    }

    await fs.remove(configPath)
    return true
  }

  /**
   * Checking current username working
   */
  static async whoami(): Promise<{ id: string; username: string }> {
    const auth = await this.readAuth()
    return pick(auth, ['id', 'username'])
  }

  static async initial() {
    const rootIsExisted = await fs.exists(this.paths.root)
    if (!rootIsExisted) {
      const rootPath = path.join(paths.tool + '/templates/root')

      info('Initializing as working item for nuz')
      await fs.copy(rootPath, this.paths.root)
    }

    const nuzrcIsExisted = await fs.exists(this.paths.nuzrc)
    if (!nuzrcIsExisted) {
      if (rootIsExisted) {
        warn('File `.nuzrc` not found, creating new will use default')
      }
      await this.use(NUZ_DEFAULT_USERNAME)
    }
  }

  static async prepare() {
    await this.initial()
  }

  static async readConfig(): Promise<ConfigData> {
    return fs.readJson(this.paths.config)
  }

  static async writeConfig(data: ConfigData): Promise<any> {
    return fs.writeJson(this.paths.config, data)
  }

  static async readAuth(authPath?: string): Promise<AuthData> {
    const auth = await fs.readJson(authPath || this.paths.auth)
    if (auth.loggedAt) {
      try {
        auth.loggedAt = new Date(auth.loggedAt)
      } catch {
        //
      }
    }

    return auth
  }

  static async writeAuth(data: AuthData): Promise<any> {
    if (data.loggedAt instanceof Date) {
      data.loggedAt = data.loggedAt.toUTCString() as any
    }

    return fs.writeJson(this.paths.auth, data)
  }

  static async authRequired(type?: UserAccessTokenTypes): Promise<AuthData> {
    const auth = await this.readAuth()
    if (auth.username === NUZ_DEFAULT_USERNAME) {
      throw new Error('You need to be logged in to do this')
    }

    if (!auth.id) {
      throw new Error('Missing user id in auth config')
    }

    if (!auth.token) {
      throw new Error('Missing token in auth config')
    }

    if (!auth.type) {
      throw new Error('Unable to identify token permission')
    }

    const permissionIsDenied =
      type && !tokenTypesHelpers.verify(auth.type, type)
    if (permissionIsDenied) {
      throw new Error('Permission denied')
    }

    return auth
  }

  static async getUsers() {
    const match = glob.sync(path.join(this.paths.users, '/*'))
    const users: {
      [username: string]: Pick<
        AuthData,
        AuthKeys.id | AuthKeys.username | AuthKeys.loggedAt
      >
    } = {}
    for (const item of match) {
      const userIsDefault = /\/(default)$/.test(item)
      if (!userIsDefault) {
        const auth = await this.readAuth(path.join(item, NUZ_AUTH_FILENAME))
        users[auth.username] = {
          id: auth.id,
          username: auth.username,
          loggedAt: auth.loggedAt,
        }
      }
    }
    return users
  }
}

export default Config
