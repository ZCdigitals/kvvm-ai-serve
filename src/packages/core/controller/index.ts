import { normalizeEmail } from "../../../utils/email";
import { EmailPattern } from "../../../utils/pattern";
import { normalizePhone } from "../../../utils/phone";
import {
  BadRequest,
  BaseRes,
  get,
  GetRequestHandler,
  handler,
  ImATeapot,
  post,
  PostRequestHandler,
  RequestHandler,
} from "../lib";
import { sendVerifyCodeEmail, sendVerifyCodePhone } from "../service";

interface PingRes extends BaseRes {
  data: unknown;
  ip?: string | string[];
}

interface PostVerifyCodeData {
  email?: string;
  phone?: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     BaseRes:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *           description: Response code, 0 for success, non-zero for error
 *           example: 0
 *         msg:
 *           type: string
 *           description: Response message
 *           example: "ok"
 *       required:
 *         - code
 *         - msg
 *   responses:
 *      400:
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 400
 *                    msg:
 *                      example: "Bad request"
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 401
 *                    msg:
 *                      example: "Unauthorized"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 403
 *                    msg:
 *                      example: "Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 404
 *                    msg:
 *                      example: "Not Found"
 *      405:
 *        description: Method Not Allowed
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 405
 *                    msg:
 *                      example: "Method Not Allowed"
 *      410:
 *        description: Gone
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 410
 *                    msg:
 *                      example: "Gone"
 *      415:
 *        description: Unsupported Media Type
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 415
 *                    msg:
 *                      example: "Unsupported Media Type"
 *      418:
 *        description: I'm a teapot
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 418
 *                    msg:
 *                      example: "I'm a teapot"
 *      422:
 *        description: Unprocessable Entity
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 422
 *                    msg:
 *                      example: "Unprocessable Entity"
 *      429:
 *        description: Too Many Requests
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 429
 *                    msg:
 *                      example: "Too Many Requests"
 *      500:
 *        description: Internal Server Error
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 500
 *                    msg:
 *                      example: "Internal Server Error"
 *      501:
 *        description: Not Implemented
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 501
 *                    msg:
 *                      example: "Not Implemented"
 *      503:
 *        description: Service Unavailable
 *        content:
 *          application/json:
 *            schema:
 *              allOf:
 *                - $ref: "#/components/schemas/BaseRes"
 *                - properties:
 *                    code:
 *                      example: 503
 *                    msg:
 *                      example: "Service Unavailable"
 *   securitySchemes:
 *     bearerAuth:
 *       description: Bearer token, get it from `/oauth/authorize`
 *       type: oauth2
 *       flows:
 *         password:
 *           authorizationUrl: http://localhost:3000/oauth/token
 */

export class CoreController {
  /**
   * @openapi
   * /:
   *  get:
   *    summary: Health check
   *    responses:
   *      200:
   *        description: OK
   */
  @get()
  public get: GetRequestHandler = (req, res, next) => {
    res.sendStatus(200);
  };

  /**
   * @openapi
   * /version:
   *  get:
   *    summary: Get version
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              allOf:
   *                - $ref: "#/components/schemas/BaseRes"
   *                - properties:
   *                    data:
   *                      type: string
   *                      description: Version
   *                      example: "1.0.0"
   *                  required:
   *                    - data
   */
  @get("/version")
  public getVersion: GetRequestHandler<BaseRes<string>> = (req, res, next) => {
    res.json({
      code: 0,
      msg: "get version ok",
      data: process.env.npm_package_version,
    });
  };

  /**
   * @openapi
   *  /coffee:
   *    get:
   *      summary: I'm a teapot
   *      responses:
   *        418:
   *          $ref: "#/components/responses/418"
   */
  @get("/coffee")
  public getCoffee: GetRequestHandler = (req, res, next) => {
    throw ImATeapot();
  };

  /**
   * @openapi
   *  /ping:
   *    get:
   *      summary: Ping
   *      parameters:
   *        - in: query
   *          name: foo
   *          schema:
   *            type: string
   *      responses:
   *        200:
   *          description: Pong
   *          content:
   *            application/json:
   *              schema:
   *                allOf:
   *                  - $ref: "#/components/schemas/BaseRes"
   *                  - properties:
   *                      msg:
   *                        example: "pong"
   *                      data:
   *                        type: object
   *                        properties:
   *                          foo:
   *                            type: string
   *                            description: Query parameter foo
   *    post:
   *      summary: Ping
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                foo:
   *                  type: string
   *      responses:
   *        200:
   *          description: Pong
   *          content:
   *            application/json:
   *              schema:
   *                allOf:
   *                  - $ref: "#/components/schemas/BaseRes"
   *                  - properties:
   *                      msg:
   *                        example: "pong"
   *                      data:
   *                        type: object
   *                        properties:
   *                          foo:
   *                            type: string
   *                            description: Query parameter foo
   */
  @handler({ path: "/ping" })
  public ping: RequestHandler<PingRes> = (req, res, next) => {
    let data;
    if (req.method === "GET") data = req.query;
    else data = req.body;
    res.json({
      code: 0,
      msg: "pong",
      data: data,
      ip: req.headers["x-client-ip"],
    });
  };

  /**
   * @openapi
   * /verify-code:
   *   post:
   *     summary: Send verification code
   *     description: Sends a verification code to either an email or phone number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *             oneOf:
   *               - required: [email]
   *               - required: [phone]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BaseRes'
   *       400:
   *         $ref: '#/components/responses/400'
   */
  @post("/verify-code")
  public postVerifyCode: PostRequestHandler<
    BaseRes<string>,
    PostVerifyCodeData
  > = async (req, res, next) => {
    const { email, phone } = req.body;

    if (email) {
      const e = normalizeEmail(email);

      if (!EmailPattern.test(e)) throw BadRequest("Must input correct email");

      await sendVerifyCodeEmail(e);
    } else if (phone) {
      const p = normalizePhone(phone);

      await sendVerifyCodePhone(p);
    } else {
      throw BadRequest("Must input email or phone");
    }

    res.json({ code: 0, msg: "ok" });
  };
}

export * from "./admin";
export * from "./dict";
export * from "./role";
