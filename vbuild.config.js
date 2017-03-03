const pkg = require('./package');

module.exports = options => ({
  copy: [{from: './static', to: './static'}],
  define: {
    __DEV__: JSON.stringify(options.dev)
  },
  env: {
    basePath: options.dev ? '' : '/flpd-resource-allocation-suggestions/'
  },
  html: {
    // `pkg` indicates the data in `package.json`
    title: pkg.title || pkg.productionName || pkg.name,
    description: pkg.description
  },
  filename: {
    static: 'static/[name].[ext]'
  },
  webpack(config) {
    if (options.stats) {
      const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin())
    }
    if(!options.dev) {
      config.output.publicPath = '/flpd-resource-allocation-suggestions/';
    }
    return config;
  },
  production: {
    sourceMap: false
  }
})
