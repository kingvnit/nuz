import React from 'react'
import { useSubscription } from 'use-subscription'

import requireModule from '../../require'
import * as shared from '../../shared'

export interface LoadableOptions {
  loading: React.ElementType<any>
  timeout?: number
  render?: any
}

type LoadState<T> = {
  loading: boolean
  loaded: T | undefined
  error: Error | null
  promise: Promise<T>
}

type Initializer = () => Promise<any>

const ALL_INITIALIZERS = [] as Initializer[]
const READY_INITIALIZERS = [] as Initializer[]

const ALL_UPDATERS = new Set<() => void>()

function flushInitializers(initializers: Initializer[]) {
  const promises = [] as any[]

  while (initializers.length) {
    const init = initializers.pop() as Initializer
    promises.push(init())
  }

  return Promise.all(promises).then(() => {
    if (initializers.length) {
      return flushInitializers(initializers)
    }
  })
}

function load<T>(loader): LoadState<T> {
  const promise: Promise<T> = loader()

  const state = {
    loading: true,
    loaded: undefined,
    error: null,
    promise: undefined,
  } as any

  state.promise = promise
    .then((loaded) => {
      state.loading = false
      state.loaded = loaded

      return loaded
    })
    .catch((error) => {
      state.loading = false
      state.error = error

      throw error
    })

  return state
}

function resolveExports(obj) {
  return obj && obj.__esModule ? obj.default : obj
}

function render(loaded: any, props) {
  return React.createElement(resolveExports(loaded), props)
}

class LoadableSubscription {
  _load: any
  _options: any
  _callbacks: any
  _delay: any
  _timeout: any
  _resolve: any
  _state: any
  _loader: any

  constructor(loadFn, loader, options) {
    this._load = loadFn
    this._loader = loader
    this._options = options
    this._callbacks = new Set()
    this._delay = null
    this._timeout = null

    this.retry()
  }

  promise() {
    return this._resolve.promise
  }

  retry() {
    this._clearTimeouts()
    this._resolve = this._load(this._loader)

    this._state = {
      pastDelay: false,
      timedOut: false,
    }

    const { _resolve: resolve, _options: options } = this

    if (resolve.loading) {
      if (typeof options.delay === 'number') {
        if (options.delay === 0) {
          this._state.pastDelay = true
        } else {
          this._delay = setTimeout(() => {
            this._update({
              pastDelay: true,
            })
          }, options.delay)
        }
      }

      if (typeof options.timeout === 'number') {
        this._timeout = setTimeout(() => {
          this._update({ timedOut: true })
        }, options.timeout)
      }
    }

    this._resolve.promise
      .then(() => {
        this._update({})
        this._clearTimeouts()
      })
      .catch((err) => {
        this._update({})
        this._clearTimeouts()
      })

    this._update({})

    if (typeof window === 'undefined') {
      ALL_UPDATERS.add(this.retry.bind(this))
    }
  }

  _update(partial) {
    this._state = {
      ...this._state,
      error: this._resolve.error,
      loaded: this._resolve.loaded,
      loading: this._resolve.loading,
      ...partial,
    }

    this._callbacks.forEach((callback) => callback())
  }

  _clearTimeouts() {
    clearTimeout(this._delay)
    clearTimeout(this._timeout)
  }

  getCurrentValue() {
    return this._state
  }

  subscribe(callback) {
    this._callbacks.add(callback)

    return () => {
      this._callbacks.delete(callback)
    }
  }
}

function empty() {
  return null
}

function createLoadableComponent(id: string, opts: LoadableOptions) {
  const options = Object.assign(
    {
      loading: empty,
      timeout: -1,
      delay: 0,
      render,
    },
    opts,
  ) as NonNullable<LoadableOptions>

  if (!options.loading) {
    throw new Error('Requires `loading` options to use loadable')
  }

  let subscription = null as any

  function initial() {
    if (!subscription) {
      const sub = new LoadableSubscription(
        load,
        () => requireModule(id),
        options,
      )
      subscription = {
        getCurrentValue: sub.getCurrentValue.bind(sub),
        subscribe: sub.subscribe.bind(sub),
        retry: sub.retry.bind(sub),
        promise: sub.promise.bind(sub),
      }
    }

    return subscription.promise()
  }

  if (typeof window === 'undefined') {
    ALL_INITIALIZERS.push(initial)
  } else {
    READY_INITIALIZERS.push(initial)
  }

  const LoadableComponent = (props, ref) => {
    initial()

    if (typeof window === 'undefined') {
      shared.extractor.push(id)
    }

    const state = useSubscription(subscription)

    React.useImperativeHandle(
      ref,
      () => ({
        retry: subscription.retry,
      }),
      [],
    )

    return React.useMemo(() => {
      if (state.loading || state.error) {
        return React.createElement(options.loading, {
          isLoading: state.loading,
          pastDelay: state.pastDelay,
          timedOut: state.timedOut,
          error: state.error,
          retry: subscription.retry,
        })
      }

      if (state.loaded) {
        return options.render(state.loaded, props)
      }

      return null
    }, [props, state])
  }

  LoadableComponent.preload = () => initial()
  LoadableComponent.displayName = 'LoadableComponent'

  return React.forwardRef(LoadableComponent)
}

function Loadable(id: string, opts: LoadableOptions) {
  return createLoadableComponent(id, opts)
}

Loadable.flushAll = function flushAll() {
  const updaters = Array.from(ALL_UPDATERS.values())
  ALL_UPDATERS.clear()

  for (const updater of updaters) {
    updater()
  }
}

Loadable.preloadAll = function preloadAll(): Promise<any> {
  return new Promise((resolve, reject) => {
    flushInitializers(ALL_INITIALIZERS).then(resolve, reject)
  })
}

Loadable.readyAll = function readyAll(): Promise<any> {
  return new Promise((resolve, reject) => {
    // We always will resolve, errors should be handled within loading UIs.
    flushInitializers(READY_INITIALIZERS).then(resolve, resolve)
  })
}

export default Loadable
