import { config } from "dotenv";
import { join } from "path";

export function loadEnv(): void {
  console.log("node env", process.env.NODE_ENV);
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    console.log("production env, will not load .env file");
    return;
  }
  const envPath = join(
    process.cwd(),
    isProduction ? ".env" : ".env.development",
  );
  console.log("env path", envPath);
  config({
    path: envPath,
    encoding: "utf8",
    debug: !isProduction,
  });
}

loadEnv();
