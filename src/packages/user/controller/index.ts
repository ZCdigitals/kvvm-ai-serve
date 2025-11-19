import { normalizeEmail } from "../../../utils/email";
import {
  BadRequest,
  BaseRes,
  del,
  Forbidden,
  get,
  GetRequestHandler,
  InternalServerError,
  NotImplemented,
  path,
  post,
  PostRequestHandler,
  put,
  Unauthorized,
} from "../../core";
import { UserInfo } from "../../core/middleware";
import { Gender } from "../../core/model";
import { FileData } from "../../file/model";
import { pureFileData } from "../../file/service";
import { loginAuth } from "../middleware";
import {
  createUserByEmail,
  createUserTokenByEmailPassword,
  deleteUser,
  readUser,
  readUserPublicInfo,
  updateUserPassword,
  updateUserPasswordByEmail,
  updateUserPrivateInfo,
  updateUserPublicInfo,
} from "../service";

interface PostData {
  username?: string;
  password?: string;
  phone?: string;
  email?: string;
  verifyCode?: string;
  inviteCode?: string;
}

interface PostTokenData {
  username?: string;
  password?: string;
  phone?: string;
  email?: string;
  verifyCode?: string;
}

interface PostPasswordData {
  email: string;
  phone?: string;
  verifyCode: string;
  password: string;
}

interface PutInfoData {
  nickName?: string;
  avatar?: FileData;
  desc?: string;
  cover?: FileData;
}

interface PutPrivateInfoData {
  gender: Gender;
}

/**
 * @openapi
 * tags:
 *  name: User
 *  description: User endpoints
 */
@path("/user")
export class UserController {
  /**
   * @openapi
   * /user:
   *   post:
   *     summary: Create a new user
   *     description: Create a new user, indentify by either username or phone or email. Currently, avaliable props combine is `email` `password` `verifyCode`
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               verifyCode:
   *                 type: string
   *             oneOf:
   *               - required: [username, password]
   *               - required: [email, verifyCode]
   *               - required: [phone, verifyCode]
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
  @post()
  public post: PostRequestHandler<BaseRes, PostData> = async (
    req,
    res,
    next,
  ) => {
    const { username, password, phone, email, verifyCode, inviteCode } =
      req.body;

    if (username) {
      throw NotImplemented();
    } else if (phone) {
      throw NotImplemented();
    } else if (email) {
      if (!verifyCode) throw BadRequest("Must input verifyCode");

      await createUserByEmail(
        normalizeEmail(email),
        verifyCode,
        password,
        inviteCode,
      );

      res.json({ code: 0, msg: "ok" });
    } else {
      throw BadRequest("Must input username or phone or email");
    }
  };

  /**
   * @openapi
   * /user/token:
   *   post:
   *     summary: Get user token
   *     description: Get user jwt token.
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               verifyCode:
   *                 type: string
   *             oneOf:
   *               - required: [username, password]
   *               - required: [email, password]
   *               - required: [email, verifyCode]
   *               - required: [phone, password]
   *               - required: [phone, verifyCode]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BaseRes'
   */
  @post("/token")
  public postToken: PostRequestHandler<BaseRes, PostTokenData> = async (
    req,
    res,
    nest,
  ) => {
    // throw NotImplemented();

    const { username, password, phone, email, verifyCode } = req.body;

    if (username) {
      throw NotImplemented();
    } else if (phone) {
      throw NotImplemented();
    } else if (email) {
      if (password) {
        const t = await createUserTokenByEmailPassword(email, password);

        res.json({ code: 0, msg: "ok", data: t });
      } else if (verifyCode) {
        throw NotImplemented();
      } else {
        throw BadRequest("Must input password or verifyCode");
      }
    } else {
      throw BadRequest("Must input username or phone or email");
    }
  };

  /**
   * @openapi
   * /user/password:
   *   post:
   *     summary: Update user password
   *     description: Update user password, verify user by verify code.
   *     tags: [User]
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
   *               password:
   *                 type: string
   *               verifyCode:
   *                 type: string
   *             oneOf:
   *               - required: [email]
   *               - required: [phone]
   *             required: [password, verifyCode]
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
  @post("/password")
  public postPassword: PostRequestHandler<BaseRes, PostPasswordData, never> =
    async (req, res, next) => {
      const { email, phone, verifyCode, password } = req.body;

      if (phone) {
        throw NotImplemented();
      } else if (email) {
        if (!verifyCode) {
          throw BadRequest("Must input verifyCode");
        } else if (!password) {
          throw BadRequest("Must input password");
        }

        await updateUserPasswordByEmail(email, verifyCode, password);
      } else {
        throw BadRequest("Must input phone or email");
      }

      res.json({ code: 0, msg: "ok" });
    };

  @get("/:id")
  @loginAuth
  public get: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    if (id !== "self" && id !== uid) {
      throw Forbidden("Can only read self");
    }

    const data = await readUser(uid!);

    res.json({ code: 0, msg: "ok", data });
  };

  @del("/:id")
  @loginAuth
  public del: PostRequestHandler<BaseRes, never, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    if (id !== "self" && id !== uid) {
      throw Forbidden("Can only delete self");
    }

    await deleteUser(uid!);

    res.json({ code: 0, msg: "ok" });
  };

  @get("/:id/info")
  public getInfo: GetRequestHandler<BaseRes, never, UserInfo> = async (
    req,
    res,
    next,
  ) => {
    let { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    if (id === "self") {
      if (!uid) throw Unauthorized();
      else id = uid;
    }

    const data = await readUserPublicInfo(id);

    res.json({ code: 0, msg: "ok", data });
  };

  @put("/:id/info")
  @loginAuth
  public putInfo: PostRequestHandler<BaseRes, PutInfoData, never, UserInfo> =
    async (req, res, next) => {
      let { id } = req.params;
      if (!id) throw InternalServerError("null id");
      const { uid } = res.locals;

      if (id === "self") id = uid!;
      if (id !== uid) throw Forbidden("Can only update self");

      const { nickName, avatar, desc, cover } = req.body;

      const data = await updateUserPublicInfo(
        uid,
        nickName,
        avatar ? pureFileData(avatar) : undefined,
        desc,
        cover ? pureFileData(cover) : undefined,
      );

      res.json({ code: 0, msg: "ok", data });
    };

  @put("/:id/private-info")
  @loginAuth
  public putPrivateInfo: PostRequestHandler<
    BaseRes,
    PutPrivateInfoData,
    never,
    UserInfo
  > = async (req, res, next) => {
    const { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;
    if (id !== uid) throw Forbidden("Can only update self");
    const { gender = Gender.Unknown } = req.body;

    const data = await updateUserPrivateInfo(uid, gender);

    res.json({ code: 0, msg: "ok", data });
  };

  @put("/:id/password")
  @loginAuth
  public putPassword: PostRequestHandler<
    BaseRes,
    { password: string },
    never,
    UserInfo
  > = async (req, res, next) => {
    let { id } = req.params;
    if (!id) throw InternalServerError("null id");
    const { uid } = res.locals;

    if (id === "self") id = uid!;
    if (id !== uid) throw Forbidden("Can only update self");

    const { password } = req.body;
    if (!password) throw BadRequest("Must input password");

    await updateUserPassword(uid, password);

    res.json({ code: 0, msg: "ok" });
  };
}
