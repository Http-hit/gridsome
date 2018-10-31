const path = require('path')
const createBaseConfig = require('./createBaseConfig')

const resolve = p => path.resolve(__dirname, p)

module.exports = app => {
  const isProd = process.env.NODE_ENV === 'production'
  const config = createBaseConfig(app, { isProd, isServer: false })
  const { targetDir, clientManifestPath } = app.config

  config.entry('app').add(resolve('../../app/entry.client.js'))

  config.node.merge({
    setImmediate: false
  })

  if (!isProd) {
    config.plugin('hmr')
      .use(require('webpack/lib/HotModuleReplacementPlugin'))

    config.plugin('no-emit-on-errors')
      .use(require('webpack/lib/NoEmitOnErrorsPlugin'))
  }

  if (isProd) {
    config.plugin('ssr-client')
      .use(require('./plugins/VueSSRClientPlugin'), [{
        filename: path.relative(targetDir, clientManifestPath)
      }])

    config.plugin('optimize-css')
      .use(require('optimize-css-assets-webpack-plugin'), [{
        canPrint: false,
        cssProcessorOptions: {
          safe: true,
          autoprefixer: { disable: true },
          mergeLonghand: false
        }
      }])
  }

  app.dispatchSync('chainWebpack', config, {
    context: app.context,
    isServer: false,
    isProd
  })

  return config
}
