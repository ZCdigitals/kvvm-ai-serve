import { notEqual, ok, strictEqual } from "node:assert";
import { describe, test } from "node:test";
import { Cache } from "../src/utils/cache";
import { nonceStr } from "../src/utils/nonceStr";
import { splitCurrency } from "../src/utils/splitCurrency";
import { timestamp } from "../src/utils/timestamp";

describe("utils unit test", () => {
  describe("nonce str", () => {
    test("should create a string, length is 16", () => {
      strictEqual(nonceStr().length, 16);
    });
    test("should create a string, length is 15", () => {
      strictEqual(nonceStr(15).length, 15);
    });
    test("two nonce string should not be same", () => {
      notEqual(nonceStr(), nonceStr());
    });
  });
  describe("split currency", () => {
    test("should output array amount", () => {
      const a = splitCurrency(100, { splitNum: 1 });
      strictEqual(a.length, 1);
      strictEqual(a[0], 100);
    });
    test("should output array amount", () => {
      const a = splitCurrency(100, { splitNum: 3 });
      strictEqual(a.length, 3);
      strictEqual(a[0], 33);
      strictEqual(a[1], 33);
      strictEqual(a[2], 34);
    });
    test("should output array amount", () => {
      const a = splitCurrency(100, { splitRateList: [3, 3, 3] });
      strictEqual(a.length, 3);
      strictEqual(a[0], 33);
      strictEqual(a[1], 33);
      strictEqual(a[2], 34);
    });
    test("should output array amount", () => {
      const a = splitCurrency(100, { splitRateList: [3, 3, 4] });
      strictEqual(a.length, 3);
      strictEqual(a[0], 30);
      strictEqual(a[1], 30);
      strictEqual(a[2], 40);
    });
  });
  describe("timestamp", () => {
    test("should be string", () => {
      strictEqual(typeof timestamp(), "string");
    });
    test("should be current time second", () => {
      const c = Date.now() / 1000.0;
      const t = parseInt(timestamp());
      ok(Math.abs(c - t) < 1);
    });
    test("should be current time millisecond", () => {
      const c = Date.now();
      const t = parseInt(timestamp(1));
      ok(Math.abs(c - t) < 2);
    });
  });
});

describe("cache", () => {
  const cache = new Cache();
  test("should set and get ok", async () => {
    const key = "key123";
    const value = "value 456";
    await cache.set(key, value);
    strictEqual(await cache.get(key), value);
  });
});
