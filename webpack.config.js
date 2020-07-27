'use strict';

const webpack = require('webpack');
const path = require('path');
const TEST = process.env.NODE_ENV === 'test';
const packageData = require('./package.json');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  })
];

module.exports = {
  context: __dirname + '/src',
  entry: {
    'playkit-visibility': 'index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: ['KalturaPlayer', 'plugins', 'visibility'],
    umdNamedDefine: true,
    libraryTarget: 'umd',
    devtoolModuleFilenameTemplate: './visibility/[resource-path]'
  },
  devtool: TEST ? 'inline-source-map' : 'source-map',
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              rules: {
                semi: 0
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: __dirname + '/src'
  },
  resolve: {
    alias: TEST
      ? {
          'kaltura-player-js': path.resolve('./node_modules/kaltura-player-js/dist/kaltura-ovp-player')
        }
      : {},
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  externals: TEST
    ? {}
    : {
        'kaltura-player-js': {
          commonjs: 'kaltura-player-js',
          commonjs2: 'kaltura-player-js',
          amd: 'kaltura-player-js',
          root: ['KalturaPlayer']
        },
        '@playkit-js/playkit-js-ui': {
          commonjs: '@playkit-js/playkit-js-ui',
          commonjs2: '@playkit-js/playkit-js-ui',
          amd: 'playkit-js-ui',
          root: ['KalturaPlayer', 'ui']
        }
      }
};
