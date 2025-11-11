import express, { json, urlencoded } from "express";
import expressWs from "express-ws";
import morgan from "morgan";
import {
  errorRequestHandler,
  getInstallForApp,
  NotFound,
} from "./packages/core";
import {
  CoreAdminController,
  CoreController,
  DictController,
  RoleController,
} from "./packages/core/controller";
import { cors, options, useLocale } from "./packages/core/middleware";
import { CoturnController } from "./packages/coturn/controller";
import { DeviceController } from "./packages/device/controller";
import { FileController } from "./packages/file/controller";
import { UserController } from "./packages/user/controller";
import { auth } from "./packages/user/middleware";
import { installWsController } from "./packages/ws/controller";

const { app } = expressWs(express());

// disable cache
app.disable("etag");
// disable x-powered-by
app.disable("x-powered-by");

// use log
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));

// use parse
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: false }));

// cors
// options
// user auth
// use locale
app.use(cors, options, auth, useLocale);

// install business controller
const install = getInstallForApp(app);
// 路由路径没有交集的控制器可以任意安装顺序
install(CoreController);
install(CoreAdminController);
install(CoturnController);
install(DeviceController);
install(DictController);
install(FileController);
install(RoleController);
install(UserController);

// install websocket controller
installWsController(app);

// not found
app.use((req, res, next) => {
  next(NotFound());
});

// error handle
app.use(errorRequestHandler);

export default app;
