module.exports = options => ({
  copy: [{from: './static', to: './static'}],
  define: {
    __DEV__: JSON.stringify(options.dev)
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
