import { Types } from "mongoose";
import assert from "node:assert";
import { describe, test } from "node:test";

describe("mongoose intergration test", () => {
  test("ObjectId equal test", () => {
    const ii = "6880558c403aaed1cba5de16";
    const id = new Types.ObjectId(ii);
    const id2 = new Types.ObjectId(ii);
    assert(id.equals(id2), "id not equal");
    assert(id.equals(ii), "id not equal string");
  });
});
