import {
  BaseRes,
  GetRequestHandler,
  handler,
  InternalServerError,
  path,
  post,
  PostRequestHandler
} from "../../core";
import { adminRoleAuth, UserInfo } from "../../core/middleware";
import { loginAuth } from "../../user/middleware";
import {
  readPrivateFilePath,
  readPublicFilePath,
  savePrivateFile,
  savePublicFiles,
} from "../service";

interface PostFileRes extends BaseRes {
  data: Record<string, string[]>;
}

@path("/file")
export class FileController {
  @handler({ path: "/public/:file", method: "use" })
  public usePublic: GetRequestHandler = async (req, res, next) => {
    const { file } = req.params;
    if (!file) throw InternalServerError("null file");

    res.sendFile(readPublicFilePath(file));
  };

  @handler({ path: "/private/:file", method: "use" })
  @loginAuth
  public usePrivate: GetRequestHandler<never, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { file } = req.params;
    if (!file) throw InternalServerError("null file");
    const { uid } = res.locals;

    res.sendFile(readPrivateFilePath(uid!, file));
  };

  @post("/public")
  @adminRoleAuth
  public postPublic: PostRequestHandler<PostFileRes, unknown, never, UserInfo> =
    async (req, res, next) => {
      const data = await savePublicFiles(req);

      res.json({ code: 0, msg: "ok", data: data });
    };

  @post()
  @loginAuth
  public post: PostRequestHandler<PostFileRes, unknown, never, UserInfo> =
    async (req, res, next) => {
      const { uid } = res.locals;

      const data = await savePrivateFile(req, uid!);

      res.json({ code: 0, msg: "ok", data: data });
    };
}
