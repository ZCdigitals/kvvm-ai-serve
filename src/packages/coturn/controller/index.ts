import { BaseRes, get, GetRequestHandler, path } from "../../core";
import { UserInfo } from "../../core/middleware";
import { loginAuth } from "../../user/middleware";
import { readCoturnUser } from "../service";

@path("/coturn")
@loginAuth
export class CoturnController {
  @get("/user")
  public getSession: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { uid } = res.locals;

    const data = readCoturnUser(uid!);

    res.json({ code: 0, msg: "ok", data: data });
  };
}
