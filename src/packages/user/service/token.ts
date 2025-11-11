import JWT, { JWTPayload } from "@liuhlightning/jwt";
import { getModelForClass } from "@typegoose/typegoose";
import { NotFound, Unauthorized } from "../../core";
import { UserInfo } from "../../core/middleware";
import { UserClass } from "../model";

const UserModel = getModelForClass(UserClass);

if (!process.env.JWT_SECRET) throw new Error("Must set JWT_SECRET");
const jwt = new JWT(process.env.JWT_SECRET, {
  issuer: "KVVM.AI",
});

type Payload = JWTPayload & UserInfo;

function generateUserToken(
  uid: string,
  username: string,
  role?: string,
  scope?: string[],
): string {
  return jwt.sign({
    sub: "user",
    aud: "KVVM.AI",
    uid: uid,
    username: username,
    role: role,
    scope: scope,
  });
}

export function verifyUserToken(token: string): UserInfo {
  const p = jwt.verify<Payload>(token, {
    subject: "user",
    audience: "KVVM.AI",
  });

  const { uid, username, role, scope } = p;

  return { uid, username, role, scope };
}

export async function createUserTokenByEmailPassword(
  email: string,
  password: string,
) {
  const u = await UserModel.findOne(
    { email: email },
    { username: 1, password: 1, role: 1 },
  );
  if (!u) throw NotFound(`User ${email} not found`);

  if (!u.comparePassword(password)) throw Unauthorized();

  return generateUserToken(
    u._id.toString(),
    u.username,
    u.role?.toString(),
    undefined,
  );
}
