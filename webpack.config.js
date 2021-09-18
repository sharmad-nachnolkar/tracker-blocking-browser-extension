const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FilemanagerPlugin = require("filemanager-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    background: path.resolve(__dirname, "./src/js/background.js"),
    popup: path.resolve(__dirname, "./src/js/popup.js"),
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|dist)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/html", to: "html" },
        { from: "src/assets", to: "assets" },
        { from: "config/manifest.json", to: "." },
        { from: "config/_locales", to: "_locales" },
      ],
    }),
  ],
  devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      // new TerserPlugin({
      //   parallel: true,
      //   terserOptions: {
      //     format: {
      //       comments: false,
      //     },
      //   },
      //   extractComments: false,
      // }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: "zip",
                source: "./dist",
                destination: "./dist/build.zip",
                options: { zlib: { level: 6 } },
              },
            ],
          },
        },
      }),
    ],
  },
};
