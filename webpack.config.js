const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// webpack plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// postcss plugins
const autoprefixer = require('autoprefixer');

const isDev = process.env.NODE_ENV !== 'production';

const src = path.join(__dirname, 'src');
const srcApp = path.join(src, 'app');

const cssLoaderClient = {
  test: /\.css$/,
  exclude: [/node_modules/],
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
    },
  ].filter(Boolean),
};
const lessLoader = {
  loader: 'less-loader',
  options: { javascriptEnabled: true },
};
const lessLoaderClient = {
  test: /\.less$/,
  exclude: [/node_modules/],
  use: [...cssLoaderClient.use, lessLoader],
};
const externalLessLoaderClient = {
  test: /\.less$/,
  include: [/node_modules/],
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    'css-loader',
    lessLoader,
  ].filter(Boolean),
};

const svgLoaderClient = {
  test: /\.svg$/,
  issuer: {
    test: /\.tsx?$/,
  },
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        svgoConfig: {
          plugins: [{ inlineStyles: { onlyMatchedOnce: false } }],
        },
      },
    },
  ], // svg -> react component
};

const urlLoaderClient = {
  test: /\.(png|jpe?g|gif)$/,
  loader: require.resolve('url-loader'),
  options: {
    limit: 2048,
    name: 'assets/[name].[hash:8].[ext]',
  },
};

const mp3LoaderClient = {
  test: /\.mp3$/,
  exclude: [/node_modules/],
  loader: 'file-loader',
};

module.exports = {
  mode: isDev ? 'development' : 'production',
  name: 'client',
  target: 'web',
  devtool: 'cheap-module-inline-source-map',
  entry: {
    background_script: path.join(__dirname, 'src/background_script/index.ts'),
    content_script: path.join(__dirname, 'src/content_script/index.ts'),
    inpage_script: path.join(__dirname, 'src/inpage_script/index.ts'),
    options: path.join(__dirname, 'src/options/index.tsx'),
    popup: path.join(__dirname, 'src/popup/index.tsx'),
    prompt: path.join(__dirname, 'src/prompt/index.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
              ],
              presets: ['@babel/react', ['@babel/env', { useBuiltIns: 'entry' }]],
            },
          },
          {
            loader: 'ts-loader',
            options: { transpileOnly: isDev },
          },
        ],
      },
      lessLoaderClient,
      externalLessLoaderClient,
      cssLoaderClient,
      svgLoaderClient,
      urlLoaderClient,
      mp3LoaderClient
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    modules: [srcApp, path.join(__dirname, 'node_modules')],
    alias: {
      api: `${srcApp}/api`,
      components: `${srcApp}/components`,
      lib: `${srcApp}/lib`,
      modules: `${srcApp}/modules`,
      pages: `${srcApp}/pages`,
      prompts: `${srcApp}/prompts`,
      static: `${srcApp}/static`,
      store: `${srcApp}/store`,
      styles: `${srcApp}/styles`,
      typings: `${srcApp}/typings`,
      utils: `${srcApp}/utils`,
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[hash:8].css',
    }),
    new HtmlWebpackPlugin({
      template: `${src}/options/template.html`,
      chunks: ['options'],
      filename: 'options.html',
      inject: true,
    }),
    new HtmlWebpackPlugin({
      template: `${src}/popup/template.html`,
      chunks: ['popup'],
      filename: 'popup.html',
      inject: true,
    }),
    new HtmlWebpackPlugin({
      template: `${src}/prompt/template.html`,
      chunks: ['prompt'],
      filename: 'prompt.html',
      inject: true,
    }),
    new CopyWebpackPlugin([{ from: 'static/*', flatten: true }]),
  ],
};
