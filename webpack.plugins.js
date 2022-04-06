const path = require("path");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(
          __dirname,
          "node_modules",
          "ffmpeg-ffprobe-static",
          "ffprobe.exe"
        ),
        to: path.resolve(__dirname, ".webpack", "main"),
      },
      {
        from: path.resolve(
          __dirname,
          "node_modules",
          "ffmpeg-ffprobe-static",
          "ffmpeg.exe"
        ),
        to: path.resolve(__dirname, ".webpack", "main"),
      },
    ],
  }),
];
