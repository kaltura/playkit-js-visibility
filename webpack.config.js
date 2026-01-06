'use strict';

const webpack = require('webpack');
const path = require('path');
const packageData = require('./package.json');
const {insertStylesWithNonce} = require('@playkit-js/webpack-common');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  }),
  new ESLintPlugin({
    extensions: ['js'],
    exclude: 'node_modules'
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
    devtoolModuleFilenameTemplate: './visibility/[resource-path]'
  },
  devtool: 'source-map',
  plugins: plugins,
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
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
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {
                id: `${packageData.name}`
              },
              insert: insertStylesWithNonce
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          },
          {
            loader: 'sass-loader'
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
    static: {
      directory: path.join(__dirname, 'demo')
    },
    client: {
      progress: true
    }
  },
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  externals: {
    '@playkit-js/kaltura-player-js': ['KalturaPlayer']
  }
};
