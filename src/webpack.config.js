const path = require("path");
const ngToolsWebpack = require("@ngtools/webpack");

module.exports = {
  mode: "production",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "@ngtools/webpack",
      },
    ],
  },
  plugins: [
    new ngToolsWebpack.AngularCompilerPlugin({
      tsConfigPath: "./tsconfig.json",
      entryModule: "./src/app/app.module#AppModule",
    }),
  ],
};
