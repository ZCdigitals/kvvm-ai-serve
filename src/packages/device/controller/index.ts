import {
  BadRequest,
  BaseRes,
  del,
  get,
  GetRequestHandler,
  InternalServerError,
  path,
  post,
  PostRequestHandler,
  put,
} from "../../core";
import { UserInfo } from "../../core/middleware";
import { loginAuth } from "../../user/middleware";
import {
  createDevice,
  createDeviceKey,
  deleteDevice,
  readDevice,
  readDeviceKey,
  readDevices,
  sendDeviceRequest,
  updateDevice,
} from "../service";

interface PostData {
  name: string;
  desc?: string;
}

interface PutData {
  name?: string;
  desc?: string;
}

@path("/device")
@loginAuth
export class DeviceController {
  @get()
  public get: GetRequestHandler<
    BaseRes<Array<unknown>>,
    { skip?: string; limit?: string },
    UserInfo
  > = async (req, res, next) => {
    const { skip = "0", limit = "10" } = req.query;
    const { uid } = res.locals;

    const data = await readDevices(uid!, parseInt(skip), parseInt(limit));

    res.json({ code: 0, msg: "ok", data: data });
  };

  @post()
  public post: PostRequestHandler<BaseRes, PostData, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { name, desc } = req.body;
    if (!name) throw BadRequest("Name is required");
    const { uid } = res.locals;

    const data = await createDevice(uid!, name, desc);

    res.json({ code: 0, msg: "ok", data: data });
  };

  @get("/:id")
  public getById: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    const data = await readDevice(id, uid!);

    res.json({ code: 0, msg: "ok", data: data });
  };

  @put("/:id")
  public put: PostRequestHandler<BaseRes, PutData, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { name, desc } = req.body;
    const { uid } = res.locals;

    const data = await updateDevice(id, uid!, name, desc);

    res.json({ code: 0, msg: "ok", data: data });
  };

  @del("/:id")
  public del: PostRequestHandler<BaseRes, never, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    await deleteDevice(id, uid!);

    res.json({ code: 0, msg: "ok" });
  };

  @get("/:id/key")
  public getKey: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    const data = await readDeviceKey(id, uid!);

    res.json({ code: 0, msg: "ok", data: data });
  };

  @post("/:id/key")
  public postKey: PostRequestHandler<BaseRes, never, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    const data = await createDeviceKey(id, uid!);

    res.json({ code: 0, msg: "ok", data: data });
  };

  @post("/:id/fetch")
  public postFetch: PostRequestHandler<
    BaseRes,
    Record<string, unknown>,
    never,
    UserInfo
  > = async (req, res, next) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    await sendDeviceRequest(id, uid!, req.body, res);

    // res will be sent by service
  };
}
