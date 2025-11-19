import { strictEqual } from "node:assert";
import { describe, test } from "node:test";
import { buildTestUserHeaders, service } from ".";

describe("core intergration test", () => {
  test("get version", async () => {
    const { status, data } = await service.get("/version");
    strictEqual(status, 200, "status should be 200");
    strictEqual(
      data.data,
      process.env.npm_package_version,
      "version should be equal",
    );
  });
  test("get coffee", { skip: true }, () => {
    // skip
  });
  test("get ping and post ping", async () => {
    const { status, data } = await service.get("/ping", {
      params: { data: "hello" },
    });
    strictEqual(status, 200, "status should be 200");
    strictEqual(data.data.data, "hello", "data should be equal");
    const { status: s2, data: d2 } = await service.post("/ping", {
      data: "hello",
    });
    strictEqual(s2, 200, "status should be 200");
    strictEqual(d2.data.data, "hello", "data should be equal");
  });
  test("get status", { skip: true }, async () => {
    // this test should be skipped
    // because the status api need admin role
    const { status, data } = await service.get("/status", {
      headers: await buildTestUserHeaders(),
    });
    strictEqual(status, 200, "status should be 200");
    strictEqual(data.data.mongo, 1, "mongo should be 1");
  });
});

describe("admin intergration test", { skip: true }, () => {
  // skip
});

describe("dict intergration test", () => {
  test("get dict", async () => {
    const { status, data } = await service.get("/dict", {
      params: { name: "test" },
    });
    strictEqual(status, 200, "status should be 200");
    strictEqual(data.data.name, "test", "name should be test");
  });
});

describe("role intergration test", () => {
  test("get role", async () => {
    const { data } = await service.post("/user/token", {
      email: "admin@kvvm.ai",
      password: "admin12345",
    });
    const { status, data: d2 } = await service.get("/role", {
      headers: { Authorization: `Bearer ${data.data}` },
    });
    strictEqual(status, 200, "status should be 200");
    strictEqual(d2.data.name, "admin", "role should be admin");
  });
});
