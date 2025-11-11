import { DocumentType, getModelForClass } from "@typegoose/typegoose";
import { Unauthorized } from "../../core";
import { InputId } from "../../core/model";
import { checkVerifyCodeEmail } from "../../core/service";
import { UserClass } from "../model";

const UserModel = getModelForClass(UserClass);

async function updateUserPasswordInner(
  user: DocumentType<UserClass>,
  password: string,
) {
  user.password = password;

  await user.save();

  return user;
}

export async function updateUserPassword(id: InputId, password: string) {
  const u = await UserModel.findById(id);
  if (!u) throw Unauthorized();

  return await updateUserPasswordInner(u, password);
}

export async function updateUserPasswordByEmail(
  email: string,
  verifyCode: string,
  password: string,
) {
  const c = await checkVerifyCodeEmail(email, verifyCode);
  if (!c) throw Unauthorized("Email verify fail");

  const u = await UserModel.findOne({ email: email });
  if (!u) throw Unauthorized();

  return await updateUserPasswordInner(u, password);
}
