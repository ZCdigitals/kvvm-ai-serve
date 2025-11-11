import { BaseRes, get, GetRequestHandler, path } from "../../core";
import { loginAuth } from "../../user/middleware";
import { UserInfo } from "../middleware";
import { readRole } from "../service";

/**
 * @openapi
 * tags:
 *   - name: Role
 *     description: Operations related to user roles and permissions
 */
@path("/role")
@loginAuth
export class RoleController {
  /**
   * @openapi
   * /role:
   *   get:
   *     summary: Get current user's role information
   *     description: Retrieves detailed information about the authenticated user's role
   *     tags: [Role]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Role information successfully retrieved
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/BaseRes'
   *                 - properties:
   *                     data:
   *                       $ref: '#/components/schemas/Role'
   *       401:
   *         $ref: '#/components/responses/401'
   */
  @get()
  public getSelf: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { role } = res.locals;
    if (!role) {
      res.json({ code: 0, msg: "null role" });
      return;
    }
    const data = await readRole(role);
    res.json({ code: 0, msg: "ok", data });
  };
}
