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
  webpack(webpackConfig) {
    if(!options.dev) {
      webpackConfig.output.publicPath = '/flpd-resource-allocation-suggestions/';
    }
    return webpackConfig;
  }
})
