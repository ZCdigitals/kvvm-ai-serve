import {
  AnyConstructor,
  BaseQuery,
  BaseRes,
  Controller,
  ControllerConstructor,
  RequestHandler,
} from ".";

export type ControllerMiddlewareDecorator = (target: AnyConstructor) => void;

export type HandlerMiddlewareDecorator = (
  target: unknown,
  propertyKey: string | symbol,
) => void;

export type MiddlewareDecorator = (
  target: unknown,
  propertyKey?: string | symbol,
) => void;

/**
 * build middleware decorator
 * @param middleware middleware
 * @returns middleware decorator
 */
export function buildMiddleware<
  ResBody extends BaseRes | null = BaseRes,
  ReqBody = unknown,
  ReqQuery extends BaseQuery = BaseQuery,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  middleware: RequestHandler<ResBody, ReqBody, ReqQuery, Locals>,
): MiddlewareDecorator {
  return (...args: unknown[]) => {
    if (args.length === 1) {
      // controller middleware
      const target = args[0] as ControllerConstructor;
      if (!target.prototype._middlewares) {
        target.prototype._middlewares = [];
      }
      target.prototype._middlewares.push(middleware);
    } else if (args.length === 3) {
      // handler middleware
      const target = args[0] as Controller;
      const propertyKey = args[1] as string | symbol;

      if (!target._handlers) {
        target._handlers = new Map();
      }

      const hh = target._handlers!.get(propertyKey);
      if (hh) {
        // handler already exist
        if (!hh.middlewares) {
          hh.middlewares = [];
        }
        // @ts-expect-error
        hh.middlewares.push(middleware);
      } else {
        // handler not exist
        target._handlers!.set(propertyKey, {
          path: "/",
          method: "all",
          // @ts-expect-error
          middlewares: [middleware],
        });
      }
    } else {
      throw new Error(
        `Middleware decorator args length must be 1 or 3, got ${args.length}`,
      );
    }
  };
}
