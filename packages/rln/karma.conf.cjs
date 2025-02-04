/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const webpack = require("webpack");

const rootConfig = require("../../karma.conf.cjs");

module.exports = function (config) {
  rootConfig(config);

  const configuration = {
    frameworks: ["mocha", "webpack"],

    files: [
      {
        pattern: "src/**/*.spec.ts",
        type: "js"
      },
      {
        pattern: "src/resources/**/*.wasm",
        included: false,
        served: true,
        watched: false,
        type: "wasm",
        nocache: true
      },
      {
        pattern: "src/resources/**/*.zkey",
        included: false,
        served: true,
        watched: false,
        nocache: true
      },
      {
        pattern: "../../node_modules/@waku/zerokit-rln-wasm/*.wasm",
        included: false,
        served: true,
        watched: false,
        type: "wasm",
        nocache: true
      }
    ],

    preprocessors: {
      "src/**/*.spec.ts": ["webpack"]
    },

    client: {
      mocha: {
        timeout: 60000 // 60 seconds
      }
    },

    browserDisconnectTimeout: 60000, // 60 seconds
    browserDisconnectTolerance: 3, // Number of tries before failing
    browserNoActivityTimeout: 60000, // 60 seconds
    captureTimeout: 120000, // 2 minutes

    mime: {
      "application/wasm": ["wasm"],
      "application/octet-stream": ["zkey"]
    },

    customHeaders: [
      {
        match: ".*\\.wasm$",
        name: "Content-Type",
        value: "application/wasm"
      },
      {
        match: ".*\\.zkey$",
        name: "Content-Type",
        value: "application/octet-stream"
      }
    ],

    proxies: {
      "/base/rln_wasm_bg.wasm":
        "/absolute" +
        path.resolve(
          __dirname,
          "../../node_modules/@waku/zerokit-rln-wasm/rln_wasm_bg.wasm"
        ),
      "/base/rln.wasm":
        "/absolute" + path.resolve(__dirname, "src/resources/rln.wasm"),
      "/base/rln_final.zkey":
        "/absolute" + path.resolve(__dirname, "src/resources/rln_final.zkey")
    },

    webpack: {
      mode: "development",
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        topLevelAwait: true
      },
      output: {
        wasmLoading: "fetch",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/base/",
        clean: true
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /node_modules/
          },
          {
            test: /\.wasm$/,
            type: "asset/resource",
            generator: {
              filename: "[name][ext]"
            }
          },
          {
            test: /\.zkey$/,
            type: "asset/resource",
            generator: {
              filename: "[name][ext]"
            }
          }
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.env.CI": process.env.CI || false,
          "process.env.DISPLAY": "Browser"
        }),
        new webpack.ProvidePlugin({
          process: "process/browser.js"
        })
      ],
      resolve: {
        extensions: [".ts", ".js", ".wasm"],
        modules: ["node_modules", "../../node_modules"],
        alias: {
          "@waku/zerokit-rln-wasm": path.resolve(
            __dirname,
            "../../node_modules/@waku/zerokit-rln-wasm/rln_wasm.js"
          )
        },
        fallback: {
          crypto: false,
          fs: false,
          path: false,
          stream: false
        }
      },
      stats: { warnings: false },
      devtool: "inline-source-map"
    },

    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: process.env.CI ? ["ChromeHeadlessCI"] : ["ChromeHeadless"],
    singleRun: true,
    concurrency: Infinity
  };

  config.set(configuration);
};
