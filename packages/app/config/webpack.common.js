const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HappyPack = require('happypack');
const WatchMissingNodeModulesPlugin = require('../scripts/utils/WatchMissingNodeModulesPlugin');
const env = require('./env');
const getHost = require('./host');

const babelDev = require('./babel.dev');
const babelProd = require('./babel.prod');

const NODE_ENV = JSON.parse(env['process.env.NODE_ENV']);
const SANDBOX_ONLY = !!process.env.SANDBOX_ONLY;
const __DEV__ = NODE_ENV === 'development'; // eslint-disable-line no-underscore-dangle
const __PROD__ = NODE_ENV === 'production'; // eslint-disable-line no-underscore-dangle
// const __TEST__ = NODE_ENV === 'test'; // eslint-disable-line no-underscore-dangle
const babelConfig = __DEV__ ? babelDev : babelProd;

const publicPath = SANDBOX_ONLY || __DEV__ ? '/' : getHost() + '/';

const sepRe = `\\${path.sep}`; // path separator regex
module.exports = {
  entry: {
    app: [
      require.resolve('./polyfills'),
      path.join(paths.appSrc, 'index.js'),
    ],
  },
  target: 'web',

  node: {
    setImmediate: false,
    module: 'empty',
    child_process: 'empty',
  },

  output: {
    path: paths.appBuild,
    publicPath,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: [paths.src,],
        exclude: [
          /eslint\.4\.1\.0\.min\.js$/,
          /typescriptServices\.js$/,
          new RegExp(`babel-runtime${sepRe}`),
        ],
        loader: 'happypack/loader',
      },

      // Remove dynamic require in jest circus
      {
        test: /format_node_assert_errors\.js/,
        loader: 'string-replace-loader',
        options: {
          search: `assert = require.call(null, 'assert');`,
          replace: `throw new Error('module assert not found')`,
        },
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      // For importing README.md
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        exclude: [/\/favicon.ico$/],
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      // A special case for favicon.ico to place it into build root directory.
      {
        test: /\/favicon.ico$/,
        include: [paths.src],
        loader: 'file-loader',
        options: {
          name: 'favicon.ico?[hash:8]',
        },
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: /\.(mp4|webm)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],

    noParse: [
      /eslint\.4\.1\.0\.min\.js$/,
      /typescriptServices\.js$/,
      /browserfs\.js/,
      /browserfs\.min\.js/,
    ],
  },

  // To make jsonlint work
  externals: ['file', 'system'],

  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    modules: ['node_modules', 'src', 'standalone-packages'],

    extensions: ['.js', '.json'],

    alias: {
      moment: 'moment/moment.js',

    },
  },

  plugins: [
    new HappyPack({
      loaders: [
        {
          path: 'babel-loader',
          query: babelConfig,
        },
      ],
    }),
    ...([
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['app'],
        filename: 'index.html',
        template: './assets/index.html',
        minify: __PROD__ && {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    ]),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `env.js`.
    new webpack.DefinePlugin(env),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),

    // Expose BrowserFS, process, and Buffer globals.
    // NOTE: If you intend to use BrowserFS in a script tag, you do not need
    // to expose a BrowserFS global.
    new webpack.ProvidePlugin({
      // Only use our local dev version of browserfs when in dev mode
      // process: 'processGlobal',
      // Buffer: 'bufferGlobal',
    }),

    // With this plugin we override the load-rules of eslint, this function prevents
    // us from using eslint in the browser, therefore we need to stop it!
    !SANDBOX_ONLY &&
    new webpack.NormalModuleReplacementPlugin(
      new RegExp(['eslint', 'lib', 'load-rules'].join(sepRe)),
      path.join(paths.config, 'stubs/load-rules.compiled.js')
    ),

    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Make the monaco editor work
    new CopyWebpackPlugin(
      [
        {
          from: __DEV__
            ? 'node_modules/monaco-editor/dev/vs'
            : 'node_modules/monaco-editor/min/vs',
          to: 'public/vs',
        },
        __PROD__ && {
          from: 'node_modules/monaco-editor/min-maps',
          to: 'public/min-maps',
        },
      ].filter(x => x)
    ),

    ...([
      // We first create a common chunk between embed and app, to share components
      // and dependencies.
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'common',
      //   chunks: ['app'],
      // }),
    ]),
    new webpack.NamedModulesPlugin(),
  ].filter(Boolean),
};
