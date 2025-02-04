import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { extractExports } from "@waku/build-utils";
import copy from "rollup-plugin-copy";

import * as packageJson from "./package.json" assert { type: "json" };

const input = extractExports(packageJson);

export default {
  input,
  output: {
    dir: "bundle",
    format: "esm"
  },
  plugins: [
    commonjs(),
    json(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    copy({
      targets: [
        {
          src: ["src/resources/*"],
          dest: "dist/resources"
        }
      ],
      copyOnce: true
    })
  ]
};
