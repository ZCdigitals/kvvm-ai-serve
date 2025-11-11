import { buildMiddleware, Forbidden } from "../../core";
import { UserInfo } from "../../core/middleware";

/**
 * check if user is admin
 */
export const adminAuth = buildMiddleware<never, never, never, UserInfo>(
  (req, res, next) => {
    // check user
    const { username } = res.locals;
    // administor
    if (username !== "admin") throw Forbidden();
    next();
  },
);
