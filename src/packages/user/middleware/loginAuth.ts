import { buildMiddleware, Unauthorized } from "../../core";
import { UserInfo } from "../../core/middleware";

/**
 * check if user is logined
 */
export const loginAuth = buildMiddleware<never, never, never, UserInfo>(
  (req, res, next) => {
    // check user
    const { uid } = res.locals;
    if (!uid) throw Unauthorized();
    next();
  },
);
