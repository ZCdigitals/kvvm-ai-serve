import {
  ErrorRequestHandler as ExpressErrorRequestHandler,
  RequestHandler as ExpressRequestHandler,
} from "express";
import { BaseRes, Controller, HttpError } from ".";

export type BaseQuery = Record<string, string | undefined>;

export type RequestHandler<
  ResBody extends BaseRes | null = BaseRes,
  ReqBody = unknown,
  ReqQuery extends BaseQuery = BaseQuery,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = ExpressRequestHandler<
  Record<string, string>,
  ResBody,
  ReqBody,
  ReqQuery,
  Locals
>;

export type GetRequestHandler<
  ResBody extends BaseRes | null = BaseRes,
  ReqQuery extends BaseQuery = BaseQuery,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = RequestHandler<ResBody, never, ReqQuery, Locals>;

export type PostRequestHandler<
  ResBody extends BaseRes | null = BaseRes,
  ReqBody = unknown,
  ReqQuery extends BaseQuery = BaseQuery,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = RequestHandler<ResBody, ReqBody, ReqQuery, Locals>;

export const errorRequestHandler: ExpressErrorRequestHandler<
  Record<string, string>,
  BaseRes
> = (err, req, res, next) => {
  console.error("error url =======>", req.method, req.url);
  console.error("error head ======>", req.headers);
  console.error("error param =====>", req.params);
  console.error("error query =====>", req.query);
  console.error("error body ======>", req.body);
  console.error("error ===========>", err);
  const { status = 500, message = "Internal Server Error" }: HttpError = err;
  res.status(status).json({ code: status, msg: message });
};

export type HandlerMethod =
  | "all"
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head"
  | "use";

export interface HandlerOption {
  path?: string;
  method?: HandlerMethod;
  middleware?: RequestHandler | RequestHandler[];
}

export interface Handler {
  path: string;
  method: HandlerMethod;
  middlewares?: RequestHandler[];
}

export type HandlerDecorator = (
  target: unknown,
  propertyKey: string | symbol,
) => void;

/**
 * handler decorator, set path and middleware
 * @param option handler option
 * @returns handler decorator
 */
export function handler(option: HandlerOption = {}): HandlerDecorator {
  const { path = "/", method = "all", middleware } = option;
  let m: RequestHandler[] | undefined = undefined;
  if (middleware) {
    if (middleware instanceof Array) {
      m = middleware;
    } else {
      m = [middleware];
    }
  }
  return (target, propertyKey) => {
    const t = target as Controller;

    // set handlers
    if (!t._handlers) {
      t._handlers = new Map<string | symbol, Handler>();
    }

    const hh = t._handlers!.get(propertyKey);
    if (hh) {
      // handler already exist
      hh.path = path;
      hh.method = method;
      if (hh.middlewares && m) {
        hh.middlewares.push(...m);
      } else if (m) {
        hh.middlewares = m;
      }
    } else {
      // handler not exist
      t._handlers!.set(propertyKey, { path, method, middlewares: m });
    }
  };
}

export type HandlerOption2 = Omit<HandlerOption, "path" | "method">;

export function get(path = "/", option: HandlerOption2 = {}): HandlerDecorator {
  return handler({ ...option, path, method: "get" });
}

export function post(
  path = "/",
  option: HandlerOption2 = {},
): HandlerDecorator {
  return handler({ ...option, path, method: "post" });
}

export function put(path = "/", option: HandlerOption2 = {}): HandlerDecorator {
  return handler({ ...option, path, method: "put" });
}

export function del(path = "/", option: HandlerOption2 = {}): HandlerDecorator {
  return handler({ ...option, path, method: "delete" });
}
