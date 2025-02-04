import { createRequire } from "module";

import { createConfig } from "@waku/build-utils";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default createConfig(pkg);
