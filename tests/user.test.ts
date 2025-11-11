import { ok, strictEqual } from "node:assert";
import { describe, test } from "node:test";
import { buildTestUserHeaders, service, testUser } from ".";

describe("user intergration test admin", () => {
  test("admin login test", async () => {
    const { status, data } = await service.post("/user/login", {
      username: "admin",
      password: "admin12345",
    });
    strictEqual(status, 200, "status should be 200");
    ok(data.data.uid, "uid should be present");
    strictEqual(data.data.username, "admin", "username should be admin");
    ok(data.data.token, "token should be present");
  });
});

describe("user intergration test login regist delete", () => {
  test("regist test username password", async () => {
    const { status, data } = await service.post("/user/regist", {
      username: "test1",
      password: "test12345",
    });
    strictEqual(status, 201, "status should be 200");
    strictEqual(data.data, "test1", "username should be test1");
  });
  test("login test username password", async () => {
    const { status, data } = await service.post("/user/login", {
      username: "test1",
      password: "test12345",
    });
    strictEqual(status, 200, "status should be 200");
    ok(data.data.uid, "uid should be present");
    strictEqual(data.data.username, "test1", "username should be test1");
    ok(data.data.token, "token should be present");
  });
  test("delete test self", async () => {
    const { data: d1 } = await service.post("/user/login", {
      username: "test1",
      password: "test12345",
    });
    const token = d1.data.token;
    const { status } = await service.delete("/user/self", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    strictEqual(status, 200, "status should be 200");
  });
});

describe("user intergration test password", () => {
  test("forget password", { skip: true }, async () => {
    // skip
  });
  test("update self password", async () => {
    const c = { headers: await buildTestUserHeaders() };
    // update password
    const { status: s1 } = await service.post(
      "/user/self/password",
      {
        password: "test12345",
        newPassword: "test123456",
        repeatPassword: "test123456",
      },
      c,
    );
    strictEqual(s1, 200, "status should be 200");
    // login with new password
    const { status: s2 } = await service.post(
      "/user/login",
      {
        username: "test",
        password: "test123456",
      },
      c,
    );
    strictEqual(s2, 200, "status should be 200");
    // update password back
    await service.post(
      "/user/self/password",
      {
        password: "test123456",
        newPassword: "test12345",
        repeatPassword: "test12345",
      },
      c,
    );
  });
});

describe("user intergration test info", () => {
  test("read self info", async () => {
    const { status, data } = await service.get("/user/self/info", {
      headers: await buildTestUserHeaders(),
    });
    strictEqual(status, 200, "status should be 200");
    strictEqual(data.data.username, "test", "username should be test");
  });
  test("update self info", async () => {
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

describe("user intergration test setting", () => {
  test("self setting", async () => {
    const c = { headers: await buildTestUserHeaders() };
    const { status: s1 } = await service.put(
      "/user/self/setting",
      { frontTheme: "dark" },
      c,
    );
    strictEqual(s1, 200, "status should be 200");
    const { status: s2, data: d2 } = await service.get("/user/self/setting", c);
    strictEqual(s2, 200, "status should be 200");
    strictEqual(d2.data.frontTheme, "dark", "theme should be dark");
  });
});

describe("user intergration test email", { skip: true }, () => {
  // skip
});
