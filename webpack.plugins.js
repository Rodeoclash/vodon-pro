const path = require("path");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, "node_modules", "@ffprobe-installer", "win32-x64"),
        to: path.resolve(__dirname, ".webpack", "win32-x64"),
      },
      {
        from: path.resolve(__dirname, "node_modules", "ffmpeg-static", "ffmpeg.exe"),
        to: path.resolve(__dirname, ".webpack", "main"),
      },
    ],
  }),
];
