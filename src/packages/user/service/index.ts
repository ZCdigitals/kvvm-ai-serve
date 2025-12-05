import { DocumentType, getModelForClass } from "@typegoose/typegoose";
import { randomUUID } from "crypto";
import { FlattenMaps } from "mongoose";
import { NotFound, Unauthorized } from "../../core";
import { InputId } from "../../core/model";
import { checkVerifyCodeEmail, useAdminRole } from "../../core/service";
import { UserClass } from "../model";

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
  username: string,
  password: string,
  phone?: string,
  email?: string,
  inviteCode?: string,
): Promise<DocumentType<UserClass>> {
  // create user
  const u = new UserModel({
    username: username,
    password: password,
    phone: phone,
    email: email,
  });
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
    `user-${randomUUID()}`,
    password ?? randomUUID(),
    undefined,
    email,
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
  username: string | undefined,
  password: string,
  phone?: string,
  email?: string,
) {
  const q: Record<string, unknown> = {};

  if (username) q.username = username;
  else if (phone) q.phone = phone;
  else if (email) q.email = email;

  const u = await UserModel.findOne(q, {
    username: 1,
    password: 1,
    role: 1,
  });
  if (!u) {
    throw NotFound(`User ${username ?? email ?? phone} not found`);
  }

  const c = u.comparePassword(password);
  if (!c) throw Unauthorized("Authorize fail");

  return u;
}

let adminUser: FlattenMaps<UserClass> | undefined = undefined;

export async function useAdmin(): Promise<FlattenMaps<UserClass>> {
  if (adminUser) return adminUser;

  const ar = await useAdminRole();

  const a = await UserModel.findOne({ username: "admin" });
  if (!a) {
    const na = new UserModel({
      username: "admin",
      password: "admin12345",
      role: ar._id,
      email: "admin@zcdigitals.com",
    });
    await na.save();
    console.log("create admin user", na._id.toString());

    adminUser = na.toJSON();
  } else {
    adminUser = a.toJSON();
  }

  return adminUser;
}

let testUser: FlattenMaps<UserClass> | undefined = undefined;

export async function useTestUser(): Promise<FlattenMaps<UserClass>> {
  if (testUser) return testUser;

  const t = await UserModel.findOne({ username: "test" });
  if (!t) {
    const nt = new UserModel({
      username: "test",
      password: "test12345",
      email: "test@zcdigitals.com",
    });
    await nt.save();
    console.log("create test user", nt._id.toString());

    testUser = nt.toJSON();
  } else {
    testUser = t.toJSON();
  }

  return testUser;
}

async function init() {
  try {
    await useAdmin();
    await useTestUser();
  } catch (err) {
    console.error("init user error", err);
  }
}

setTimeout(init, 4000);

export * from "./info";
export * from "./password";
export * from "./token";

