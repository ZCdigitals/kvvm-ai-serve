import { Router } from "express";
import { Application } from "express-ws";
import { join } from "path";
import { InternalServerError, Unauthorized } from "../../core";
import { useDeviceRequest, useDeviceResponse } from "../../device/service";
import { useAuthorization } from "../../user/middleware";

export function installWsController(app: Application) {
  const router = Router();

  const controllerPath = "/ws";

  const requestPath = "/device/:id/request";
  router.ws(requestPath, async (ws, req, next) => {
    try {
      const id = req.params.id;
      if (!id) throw InternalServerError("null id");

      const { uid } = useAuthorization(req);
      if (!uid) throw Unauthorized("Must login first");

      await useDeviceRequest(id, uid, ws);
    } catch (err) {
      next(err);
    }
  });
  console.log(
    "Install",
    "ws".padEnd(6, " "),
    join(controllerPath, requestPath),
  );

  const responsePath = "/device/:id/response";
  router.ws(responsePath, async (ws, req, next) => {
    try {
      const id = req.params.id;
      if (!id) throw InternalServerError("null id");
      const key = (req.headers["x-device-key"] ?? req.query.key) as
        | string
        | undefined;
      if (!key) throw Unauthorized();

      await useDeviceResponse(id, key, ws);
    } catch (err) {
      next(err);
    }
  });
  console.log(
    "Install",
    "ws".padEnd(6, " "),
    join(controllerPath, responsePath),
  );

  app.use(controllerPath, router);
}
