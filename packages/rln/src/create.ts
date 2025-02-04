import type { RLNInstance } from "./rln.js";

export async function createRLN(): Promise<RLNInstance> {
  // A dependency graph that contains any wasm must all be imported
  // asynchronously. This file does the single async import, so
  // that no one else needs to worry about it again.
  const rlnModule = await import("./rln.js");
  return rlnModule.create();
}
