import { JWTError } from "@liuhlightning/jwt";
import { NextFunction, Request, Response } from "express";
import { BadRequest, InternalServerError, Unauthorized } from "../../core";
import { UserInfo } from "../../core/middleware";
import { verifyUserToken } from "../service";

export function useAuthorization(req: Request): UserInfo {
  // get authorization
  const auth = (req.headers.authorization ?? req.query.access_token) as
    | string
    | undefined;
  if (!auth) return {};

  // use schema
  const as: string[] = auth.split(" ", 2);
  let schema: string;
  let parameters: string;
  if (as.length === 1) {
    // default schema
    schema = "bearer";
    parameters = as[0];
  } else if (as.length === 2) {
    schema = as[0].toLowerCase();
    parameters = as[1];
  } else {
    throw BadRequest("Authorization format error");
  }

  switch (schema) {
    case "bearer": {
      try {
        // verify token
        return verifyUserToken(parameters);
      } catch (err) {
        if (err instanceof JWTError) {
          throw Unauthorized();
        } else {
          console.error("jwt verify error", err);
          throw InternalServerError();
        }
      }
    }
    default:
      throw BadRequest(`Authorization schema not support ${schema}`);
  }
}

/**
 * get user info from authorization
 *
 * schema cloud be Basic, Digest, Negotiate, AWS4-HMAC-SHA256, Bearer
 *
 * schema is case-insensitive
 *
 * default schema is Bearer
 *
 * currently only support Bearer
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Authorization
 */
export function auth(
  req: Request,
  res: Response<unknown, UserInfo>,
  next: NextFunction,
) {
  // get authorization
  const auth = useAuthorization(req);

  const { uid, username, role, scope } = auth;
  res.locals.uid = uid;
  res.locals.username = username;
  res.locals.role = role;
  res.locals.scope = scope;

  next();
}
