import { UserInfo } from ".";
import { buildMiddleware, Forbidden } from "../lib";
import { adminRole } from "../service";

/**
 * role为admin才能访问
 */
export const adminRoleAuth = buildMiddleware<never, never, never, UserInfo>(
  (req, res, next) => {
    const { username, role } = res.locals;

    if (username === "admin") return next();
    else if (!adminRole) throw Forbidden("Null admin");
    else if (!adminRole._id.equals(role)) throw Forbidden("Not admin");

    next();
  },
);

/**
 * role不为空就可以访问
 */
export const roleAuth = buildMiddleware((req, res, next) => {
  const { username, role } = res.locals;
  if (username === "admin") return next();
  if (!role) throw Forbidden();
  next();
});
