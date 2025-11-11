import { readUser } from ".";
import { Gender, InputId } from "../../core/model";
import { FileData } from "../../file/model";

export async function readUserPublicInfo(id: InputId) {
  const u = await readUser(id);

  return u.publicInfo;
}

export async function updateUserPublicInfo(
  id: InputId,
  nickName?: string,
  avatar?: FileData,
  desc?: string,
  cover?: FileData,
) {
  const u = await readUser(id);

  u.publicInfo = {
    nickName: nickName,
    avatar: avatar,
    desc: desc,
    cover: cover,
  };
  await u.save();

  return u;
}

export async function updateUserPrivateInfo(id: InputId, gender: Gender) {
  const u = await readUser(id);

  u.privateInfo = {
    gender: gender,
  };
  await u.save();

  return u;
}
