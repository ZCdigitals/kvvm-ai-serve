import { createConnection, ConnectOptions, set } from "mongoose";

set("strictQuery", false);

const dbUrl =
  process.env.MONGODB_URI ??
  `mongodb://${process.env.MONGODB_HOST ?? "localhost"}:${
    process.env.MONGODB_PORT ?? "27017"
  }`;
const option: ConnectOptions = {
  // mongoose特有的缓存设置, 不会传给mongodb
  bufferCommands: true,
  // 数据库名称
  dbName: process.env.MONGODB_DBNAME,
  // user: "root",
  // pass: "123456",
  // 默认情况下，mongoose 在连接时会自动建立 schema 的索引。这有利于开发，但是在大型生产环境下不是十分理想，因为索引建立会导致性能下降。
  // 如果 autoIndex 设为 false，mongoose 将不会自动建立索引
  autoIndex: process.env.NODE_ENV !== "production",
  // 如果禁用缓存, 设置autoCreate也为false
  autoCreate: true,
  // MongoDB 保持的最大 socket 连接数。 poolSize 的默认值是 5。
  // 注意，MongoDB 3.4 之前， MongoDB 只允许每个 socket 同时进行一个操作，所以如果你有几个缓慢请求卡着后面快的请求，可以尝试增加连接数。
  maxPoolSize: 10,
};
if (process.env.MONGODB_USERNAME) {
  option.user = process.env.MONGODB_USERNAME;
  option.pass = process.env.MONGODB_PASSWORD;
}

export const mongo = createConnection(dbUrl, option);

mongo.on("error", (err) => {
  console.error("Mongoose connection error:", new Date(), err);
});
mongo.on("disconnected", () => {
  console.warn("Mongoose is disconnected.", new Date());
});
mongo.on("open", () => {
  console.log("Mongoose is connected!", new Date());
});

function close() {
  mongo.close().catch((err) => {
    console.error("mongo close error", err);
    process.exitCode = 11;
  });
}

// close on signal
process.on("SIGTERM", close);
process.on("SIGINT", close);
