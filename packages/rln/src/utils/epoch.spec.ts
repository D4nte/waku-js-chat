import { expect } from "chai";
import fc from "fast-check";

import { epochBytesToInt, epochIntToBytes } from "./epoch.js";

describe("epoch serialization", () => {
  it("Round trip", async function () {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0 }), async (date) => {
        const bytes = epochIntToBytes(date);
        const _date = epochBytesToInt(bytes);

        expect(_date.valueOf()).to.eq(date.valueOf());
      })
    );
  });
});
