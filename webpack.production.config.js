var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'cheap-source-map',
  entry: [
    path.resolve(__dirname, 'app/main.jsx'),
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
    new CopyWebpackPlugin([{from: 'lib/luciad', to: 'lib/luciad'}]),
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
    }),
    new webpack.optimize.DedupePlugin(),
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  node: {
    fs: "empty"
  }
};
