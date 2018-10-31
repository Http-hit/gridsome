const pMap = require('p-map')
const EventEmitter = require('events')
const PluginAPI = require('./PluginAPI')
const { defaultsDeep } = require('lodash')

class Plugins extends EventEmitter {
  constructor (app) {
    super()

    this.plugins = []

    app.config.plugins.map(entry => {
      const Plugin = require(entry.entries.serverEntry)

      if (typeof Plugin !== 'function') return
      if (!Plugin.prototype) return

      const defaults = typeof Plugin.defaultOptions === 'function'
        ? Plugin.defaultOptions()
        : {}

      const { context } = app
      const options = defaultsDeep(entry.options, defaults)
      const api = new PluginAPI(app, { options })
      const instance = new Plugin(api, options, { context })

      this.plugins.push(instance)
    })
  }

  // TODO: re-implement this
  // run () {
  //   return pMap(this.plugins, async ({ instance, source }) => {
  //     await instance.apply()

  //     if (process.env.NODE_ENV === 'development') {
  //       let regenerateTimeout = null

  //       // use timeout as a workaround for when files are renamed,
  //       // which triggers both addPage and removePage events...
  //       const regenerateRoutes = () => {
  //         clearTimeout(regenerateTimeout)
  //         regenerateTimeout = setTimeout(() => {
  //           this.emit('generateRoutes')
  //         }, 20)
  //       }

  //       source.on('removePage', regenerateRoutes)
  //       source.on('addPage', regenerateRoutes)

  //       source.on('change', (node, oldNode = node) => {
  //         if (
  //           (node && node.withPath && node.path !== oldNode.path) ||
  //           (!node && oldNode.withPath)
  //         ) {
  //           return regenerateRoutes()
  //         }

  //         this.emit('broadcast', {
  //           type: 'updateAllQueries'
  //         })
  //       })

  //       source.on('updatePage', async (page, oldPage) => {
  //         const { pageQuery: { paginate: oldPaginate }} = oldPage
  //         const { pageQuery: { paginate }} = page

  //         // regenerate route.js whenever paging options changes
  //         if (paginate.collection !== oldPaginate.collection) {
  //           return regenerateRoutes()
  //         }

  //         // send query to front-end for re-fetch
  //         this.emit('broadcast', {
  //           type: 'updateQuery',
  //           query: page.pageQuery.content,
  //           file: page.internal.origin
  //         })
  //       })
  //     }
  //   })
  // }
}

module.exports = Plugins
