import { DocumentType, getModelForClass } from "@typegoose/typegoose";
import { randomUUID } from "crypto";
import { NotFound, Unauthorized } from "../../core";
import { InputId } from "../../core/model";
import { checkVerifyCodeEmail } from "../../core/service";
import { UserClass } from "../model";
import { initUser } from "./init";

const UserModel = getModelForClass(UserClass);

async function postProcess(user: DocumentType<UserClass>) {
  return user;
}

/**
 * create user
 * @param user user
 * @param inviteCode invite code
 * @returns user
 */
export async function createUser(
  user: {
    username: string;
    password: string;
    phone?: string;
    email?: string;
  },
  inviteCode?: string,
): Promise<DocumentType<UserClass>> {
  // create user
  const u = new UserModel(user);
  await u.save();
  return u;
}

export async function createUserByEmail(
  email: string,
  verifyCode: string,
  password?: string,
  inviteCode?: string,
) {
  const c = await checkVerifyCodeEmail(email, verifyCode);
  if (!c) throw Unauthorized("Email verify fail");

  return await createUser(
    {
      username: `user-${randomUUID()}`,
      password: password ?? randomUUID(),
      email: email,
    },
    inviteCode,
  );
}

export async function readUser(user: InputId) {
  const u = await UserModel.findById(user);
  if (!u) throw NotFound(`User ${user} not found`);

  await postProcess(u);

  return u;
}

export async function deleteUser(id: InputId) {
  await UserModel.deleteOne({ _id: id });
}

export async function authorizeUserPassword(
  user: { username?: string; email?: string; phone?: string },
  password: string,
) {
  const u = await UserModel.findOne(user, {
    username: 1,
    password: 1,
    role: 1,
  });
  if (!u) {
    throw NotFound(
      `User ${user.username ?? user.email ?? user.phone} not found`,
    );
  }

  const c = u.comparePassword(password);
  if (!c) throw Unauthorized("Authorize fail");

  return u;
}

setTimeout(initUser, 4000);

export * from "./info";
export * from "./password";
export * from "./token";
