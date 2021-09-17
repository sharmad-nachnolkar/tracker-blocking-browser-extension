const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    background: path.resolve(__dirname, './src/js/background.js'),
    popup: path.resolve(__dirname, './src/js/popup.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: 'src/html', to: 'html'},
        {from: 'config/manifest.json', to: '.'},
        {from: 'config/_locales', to: '_locales'},
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: 'zip',
                source: './dist',
                destination: './dist/build.zip',
                options: {zlib: {level: 6}},
              },
            ],
          },
        },
      }),
    ],
  },
}