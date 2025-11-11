import { getModelForClass } from "@typegoose/typegoose";
import moment from "moment";
import { Types } from "mongoose";
import { scheduleJob } from "node-schedule";
import { sleep } from "../../../utils/sleep";
import { Forbidden, NotFound } from "../../core";
import { InputId } from "../../core/model";
import { DeviceClass, DeviceStatus } from "../model";
import { startWssPingJob } from "./fetch";

const DeviceModel = getModelForClass(DeviceClass);

export async function readDevices(user: InputId, skip = 0, limit = 10) {
  return await DeviceModel.find({ user: new Types.ObjectId(user) })
    .skip(skip)
    .limit(limit);
}

export async function readDevice(id: InputId, user: InputId) {
  const d = await DeviceModel.findById(id);
  if (!d) throw NotFound(`Device ${id} not found`);

  if (!d.user._id.equals(user)) {
    throw Forbidden(`Device ${id} not belongs to user ${user}`);
  }

  return d;
}

export async function createDevice(user: InputId, name: string, desc?: string) {
  const d = new DeviceModel({
    user: new Types.ObjectId(user),
    name: name,
    desc: desc,
  });

  await d.save();

  return d;
}

export async function updateDevice(
  id: InputId,
  user: InputId,
  name?: string,
  desc?: string,
) {
  const d = await readDevice(id, user);

  d.set({
    name: name,
    desc: desc,
  });

  await d.save();

  return d;
}

export async function deleteDevice(id: InputId, user: InputId) {
  const d = await readDevice(id, user);

  await d.deleteOne();
}

async function setDeviceOffline() {
  try {
    console.log("set device offline job start", new Date());

    const fiveMinutes = moment().subtract(5, "minute").toDate();

    const res = await DeviceModel.updateMany(
      {
        status: DeviceStatus.Online,
        heartbeatAt: { $lt: fiveMinutes },
      },
      { $set: { status: DeviceStatus.Offline } },
    );

    console.log("set device offline job end", res);
  } catch (err) {
    console.error("set device offline job error", err);
  }

  await sleep(1000);
}

scheduleJob("0 */5 * * * *", setDeviceOffline);
startWssPingJob();

export * from "./fetch";
export * from "./key";
export * from "./mqtt";
