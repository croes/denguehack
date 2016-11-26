var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    contentBase: './app',
    port: 8080
  },
  devtool: 'inline-source-map',
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    path.resolve(__dirname, 'app/main.jsx')
  ],
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    loaders:[
      { test: /\.css$/,  loader: 'style-loader!css?-minimize' },
      { test: /\.js[x]?$/, include: path.resolve(__dirname, 'app'), exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: 'style!css!sass'},
      { test: /\.woff$/, loader: "url-loader?limit=10000&mimetype=application/font-woff&name=[path][name].[ext]"},
      { test: /\.woff2$/, loader: "url-loader?limit=10000&mimetype=application/font-woff2&name=[path][name].[ext]"},
      { test: /\.(eot|ttf|svg|gif|png)$/, loader: "file-loader"}
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: [
      "src",
      "node_modules",
      "lib"
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
        {from: 'lib/luciad', to: 'lib/luciad'},
        {from: 'data', to: 'data'},
        {from: 'lib/samples', to: 'lib/samples'}
        ]),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new HtmlWebpackPlugin({     // Create HTML file that includes references to bundled CSS and JS.
      template: 'app/index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      inject: true
    })
    // ,new OpenBrowserPlugin({ url: 'http://localhost:8080' })
  ],
  node: {
    fs: "empty"
  }
};
