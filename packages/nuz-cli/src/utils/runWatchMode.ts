import clearConsole from 'react-dev-utils/clearConsole'

import { CHANGES_EMOJI } from '../lib/const'

import getBundleInfo, { BundleInfoOutput } from './getBundleInfo'
import print, { error, log } from './print'
import showErrorsAndWarnings from './showErrorsAndWarnings'
import * as webpackCompiler from './webpackCompiler'

function waitingForChanges(time: number) {
  const idx = Math.floor(Math.random() * CHANGES_EMOJI.length)
  const emoji = CHANGES_EMOJI[idx]
  const text = isNaN(time) ? '' : ` in ${print.time(time)}`

  log(print.dim(`[👀] build done${text}, watching for changes...`, emoji))
}

interface WatchModeOptions {
  clearConsole?: boolean
}

type EventOnChange = (
  bundleInfo: BundleInfoOutput,
  other: { initialized: boolean; firstTime: boolean },
) => void

const defaultOptions = { clearConsole: true }

async function runWatchMode(
  config: webpackCompiler.AllowWebpackConfig,
  options: WatchModeOptions = defaultOptions,
  onChange?: EventOnChange,
) {
  let initialized = false
  let firstTime = true

  const watcher = await webpackCompiler.watch(config, (err, stats) => {
    const shouldClean = initialized && options.clearConsole
    if (shouldClean) {
      clearConsole()
    }

    initialized = true

    if (err) {
      error('Error(s) has occurred')
      log(err)
      return
    }

    const bundleInfo = getBundleInfo(stats)
    if (!bundleInfo.done) {
      showErrorsAndWarnings(bundleInfo)
      return
    }

    const buildTime =
      ((stats || {}) as any).endTime - ((stats || {}) as any).startTime
    waitingForChanges(buildTime)

    if (typeof onChange === 'function') {
      onChange(bundleInfo, { initialized, firstTime })
    }

    firstTime = false
  })

  return watcher
}

export default runWatchMode
