import { ok, strictEqual } from "node:assert";
import { describe, test } from "node:test";
import { buildTestUserHeaders, service, testUser } from ".";

describe("user intergration test", () => {
  test("post and delete", async () => {
    const { status: s1 } = await service.post("/user", {
      email: "test1@zcdigitals.com",
      password: "test12345",
      verifyCode: process.env.VERIFY_CODE,
    });
    strictEqual(s1, 200, "status should be 200");

    const { status: s2, data } = await service.post("/user/token", {
      email: "test1@zcdigitals.com",
      password: "test12345",
    });
    strictEqual(s2, 200, "status should be 200");
    ok(data.data, "token should be present");

    const { status: s3 } = await service.delete("/user/self", {
      headers: { Authorization: `Bearer ${data.data}` },
    });
    strictEqual(s3, 200, "status should be 200");
  });
});

describe("user intergration test password", () => {
  test("post password", { skip: true }, async () => {
    // skip
  });

  test("put self password", async () => {
    const c = { headers: await buildTestUserHeaders() };
    // update password
    const { status: s1 } = await service.put(
      "/user/self/password",
      { password: "test123456" },
      c,
    );
    strictEqual(s1, 200, "status should be 200");

    // login with new password
    const { status: s2 } = await service.post(
      "/user/token",
      { email: testUser.email, password: "test123456" },
      c,
    );
    strictEqual(s2, 200, "status should be 200");

    // update password back
    await service.put("/user/self/password", { password: "test12345" }, c);
  });
});

describe("user intergration test info", () => {
  test("get self info", async () => {
    const { status } = await service.get("/user/self/info", {
      headers: await buildTestUserHeaders(),
    });
    strictEqual(status, 200, "status should be 200");
  });

  test("put self info", async () => {
    const c = { headers: await buildTestUserHeaders() };
    const { status: s1 } = await service.put(
      "/user/self/info",
      { nickName: "test nick name" },
      c,
    );
    strictEqual(s1, 200, "status should be 200");
    const { status: s2, data: d2 } = await service.get("/user/self/info", c);
    strictEqual(s2, 200, "status should be 200");
    strictEqual(
      d2.data.nickName,
      "test nick name",
      "nick name should be test nick name",
    );
  });
});
