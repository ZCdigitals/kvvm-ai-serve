import { Application, Router } from "express";
import { join } from "path";
import { Handler, RequestHandler } from ".";

export type ControllerConstructor = new (...args: unknown[]) => Controller;
export type AnyConstructor = new (...args: unknown[]) => unknown;

function handlerWarper(h: RequestHandler): RequestHandler {
  return (req, res, next) => {
    try {
      const p = h(req, res, next);
      if (p instanceof Promise) p.catch(next);
    } catch (err) {
      next(err);
    }
  };
}

export function getInstallForApp(app: Application) {
  return (controller: AnyConstructor) => {
    const c = new controller() as Controller;
    if (!c._path) c._path = "/";
    if (!c._handlers) {
      console.warn(`Controller ${c.name} has no handlers`);
      return;
    }

    // build router
    const router = Router();

    // use handler
    for (const [key, h] of c._handlers.entries()) {
      const hh: RequestHandler | undefined = c[key] as RequestHandler;
      if (!hh) {
        throw new Error(
          `Controller ${c.name} handler ${key.toString()} not found`,
        );
      } else if (!(hh instanceof Function)) {
        throw new Error(
          `Controller ${c.name} handler ${key.toString()} is not a function`,
        );
      }

      // use handler
      router[h.method](h.path, ...(h.middlewares ?? []), handlerWarper(hh));
      console.log(
        "Install",
        h.method.padEnd(6, " "),
        join(c._path ?? "/", h.path),
      );
    }

    // use router
    app.use(c._path, ...(c._middlewares ?? []), router);
  };
}

export interface ControllerOption {
  path?: string;
  middleware?: RequestHandler | RequestHandler[];
}

export type ControllerHandlerKey = string | symbol;

/**
 * controller
 */
export interface Controller {
  /**
   * 路径 会注册到app.use(path, router)上
   */
  _path?: string;
  /**
   * 中间件 所有的路由都会注册这里的中间件
   */
  _middlewares?: RequestHandler[];
  /**
   * 处理器
   */
  _handlers?: Map<ControllerHandlerKey, Handler>;

  [key: ControllerHandlerKey]: unknown | RequestHandler | undefined;
}

export type PathDecorator = (target: AnyConstructor) => void;

/**
 * set controller path
 * @param p path
 * @returns path decorator
 */
export function path(p = "/"): PathDecorator {
  return (target) => {
    target.prototype._path = p;
  };
}
