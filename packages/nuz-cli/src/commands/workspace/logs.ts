import print, { common, error, info, log } from '../../utils/print'

export const notifyOnStart = () => {
  log()
  info(`Start development in workspace mode!`)
  log()
}

export const foundModulesConfig = (modulesConfig: any[]) => {
  info(`Found ${print.bold(modulesConfig.length)} modules config...`)
}

export const workspaceIsNotFound = () => {
  error(`Not found workspace config`)
}

export const moduleConfigIsInvalid = (dir: string) => {
  info(`Found invalid config, check at ${print.link(dir)}`)
}

export const moduleConfigIsFactoring = ({
  config,
  dir,
}: {
  config: any
  dir: string
}) => {
  info(
    `Found module ${print.name(config.name)}, library ${print.name(
      config.library,
    )}, linked at ${print.link(dir)}`,
  )
}

export const workspaceIsBuilding = (keys: string[]) => {
  const length = keys.length

  log()
  if (length === 0) {
    error('Not have config factories in the workspace!')
  } else {
    info(
      `Workspace is having ${print.bold(length)} modules, all are building...`,
    )
    info(`Building modules ${keys.map((k) => print.name(k)).join(', ')}.`)
  }
  log()
}

export const cleanFolder = (path: string) => {
  info(`Clean up dist folder before run build at ${print.link(path)}.`)
}

export const configIsNotFound = common.configIsNotFound
export const configIsInvalid = common.configIsInvalid
export const waitingForChanges = common.waitingForChanges
export const buildFailed = common.buildFailed
export const showErrorsAndWarnings = common.showErrorsAndWarnings
