import { integrityHelpers } from '@nuz/utils'
import path from 'path'
import webpack from 'webpack'
import * as yargs from 'yargs'

import { BuildCommand, CommandConfig, CommandTypes } from '../../types'

import clearConsole from '../../utils/clearConsole'
import * as configHelpers from '../../utils/configHelpers'
import * as fs from '../../utils/fs'
import getBundleInfo from '../../utils/getBundleInfo'
import getFeatureConfig from '../../utils/getFeatureConfig'
import * as paths from '../../utils/paths'
import { exit } from '../../utils/process'
import * as webpackCompiler from '../../utils/webpackCompiler'
import webpackConfigFactory from '../../utils/webpackConfigFactory'

import * as logs from './logs'

// @ts-ignore
const execute = async ({ clean }: yargs.Argv<BuildCommand>) => {
  const moduleDir = paths.cwd

  const configIsExisted = configHelpers.exists(moduleDir)
  if (!configIsExisted) {
    logs.configIsNotFound()
    return exit(1)
  }

  const moduleConfig = configHelpers.extract(moduleDir)
  if (!moduleConfig) {
    logs.configIsInvalid()
    return exit(1)
  }

  const { name, output } = moduleConfig

  const featureConfig = getFeatureConfig(moduleDir, moduleConfig)

  clearConsole()
  logs.notifyOnStart(name)

  logs.enableFeatures(featureConfig)

  if (clean) {
    const distPath = path.join(moduleDir, path.dirname(output))
    logs.cleanFolder(distPath)

    await fs.emptyDir(distPath)
  }

  const buildConfig = webpackConfigFactory(
    {
      dev: false,
      cache: true,
      dir: moduleDir,
      config: moduleConfig,
    },
    featureConfig,
  )

  let result
  try {
    result = await webpackCompiler.run(buildConfig as webpack.Configuration)
  } catch (error) {
    logs.buildFailed(error)
    return exit(1)
  }

  const bundleInfo = getBundleInfo(result)
  if (!bundleInfo.done) {
    logs.showErrorsAndWarnings(bundleInfo)
    return exit(1)
  }

  const outputFile = path.join(moduleDir, output)
  const integrity = integrityHelpers.file(outputFile)
  logs.bundleIsDone(name, integrity)

  return exit(0)
}

const config: CommandConfig<{ clean: true }> = {
  type: CommandTypes.build,
  description: 'Bundle auto optimized code and minify code size for production',
  transform: (yarg) =>
    yarg.option('clean', {
      alias: 'c',
      describe: 'Clean dist folder before run build',
      type: 'number',
      default: true,
      required: false,
    }),
  execute,
}

export default config
