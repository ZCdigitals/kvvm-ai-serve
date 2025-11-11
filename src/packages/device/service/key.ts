import { getModelForClass } from "@typegoose/typegoose";
import { DeviceKeyClass } from "../model";
import { InputId } from "../../core/model";
import { Types } from "mongoose";
import { randomBytes } from "crypto";
import { readDevice } from ".";

const DeviceKeyModel = getModelForClass(DeviceKeyClass);

export async function createDeviceKey(id: InputId, user: InputId) {
  // verify ownership
  await readDevice(id, user);

  // delete exists
  await DeviceKeyModel.deleteMany({ device: new Types.ObjectId(id) });

  // create new
  const key = randomBytes(32).toString("hex");

  const k = new DeviceKeyModel({ key: key, device: id });
  await k.save();

  return key;
}

export async function readDeviceKey(id: InputId, user: InputId) {
  // verify ownership
  await readDevice(id, user);

  // count
  const kc = await DeviceKeyModel.countDocuments({
    device: new Types.ObjectId(id),
  });

  return kc > 0 ? "***" : undefined;
}

export async function checkDeviceKey(id: InputId, key: string) {
  // count
  const kc = await DeviceKeyModel.countDocuments({
    device: new Types.ObjectId(id),
    key: key,
  });

  return kc > 0;
}
