// must be the first import
import "../src/config";
// tests
import axios from "axios";
import { lstatSync, readdirSync } from "fs";
import { basename, join } from "path";

export const service = axios.create({
  baseURL: `http://localhost:${process.env.PORT ?? "3000"}`,
});

class TestUser {
  public readonly email: string;
  private readonly password: string;
  private _id?: string;
  private _token?: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  public async postToken() {
    const { status, data } = await service.post("/user/token", {
      email: this.email,
      password: this.password,
    });
    if (status === 200) {
      this._token = data.data;
    }
    return { status, data };
  }

  public async token() {
    if (!this._token) {
      await this.postToken();
    }
    return this._token;
  }
}
export const testUser = new TestUser("test@zcdigitals.com", "test12345");
export async function buildTestUserHeaders() {
  return {
    Authorization: `Bearer ${await testUser.token()}`,
  };
}

const TEST_FILE_PATTERN = /.*\.test\.ts$/;

function test(path: string = __dirname) {
  const list = readdirSync(path);
  list.forEach((file) => {
    const filePath = join(path, file);
    const st = lstatSync(filePath);
    if (st.isDirectory()) {
      test(filePath);
    } else if (TEST_FILE_PATTERN.test(basename(file))) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(filePath);
    }
  });
}

test();
