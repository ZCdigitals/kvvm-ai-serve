import { getModelForClass } from "@typegoose/typegoose";
import { Response } from "express";
import { Types } from "mongoose";
import { connect } from "mqtt";
import { BadRequest } from "../../core";
import { DeviceClass, DeviceStatus } from "../model";
import { InputId } from "../../core/model";
import { readDevice } from ".";

const DeviceModel = getModelForClass(DeviceClass);

function initMqtt() {
  if (!process.env.MQTT_BROKER_URL) return;

  const u = new URL(process.env.MQTT_BROKER_URL);

  const client = connect(process.env.MQTT_BROKER_URL, {
    port: parseInt(u.port),
    clientId: process.env.MQTT_CLIENT_ID,
    username: u.username,
    password: u.password,
    clean: true,
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    console.log("mqtt connected");
  });

  client.on("error", (err) => {
    console.error("mqtt error", err);
    process.exit(1);
  });

  client.on("close", () => {
    console.log("mqtt disconnected");
  });

  const close = () => {
    client.end((err) => {
      if (err) {
        console.error("mqtt end error", err);
        process.exitCode = 101;
      }
    });
  };

  // close on signal
  process.on("SIGTERM", close);
  process.on("SIGINT", close);

  client.on("message", onMessage);

  client.subscribe([
    "device/+/heartbeat",
    "device/+/status",
    "device/+/response",
  ]);

  return client;
}

const client = initMqtt();

const userRess = new Map<string, Response>();

export async function sendDeviceRequest(
  id: string,
  user: InputId,
  data: Record<string, unknown> | undefined,
  res: Response,
) {
  if (!client) return;

  // ensuer ownership
  await readDevice(id, user);

  const t = `device/${id}/fetch`;

  client.publish(
    t,
    JSON.stringify({
      ...data,
      time: Math.round(Date.now() / 1000.0),
    }),
  );

  userRess.set(id, res);
}

export function sendDeviceResponse(id: string, data: unknown | undefined) {
  const ures = userRess.get(id);

  ures?.json({ code: 0, msg: "ok", data: data });
}

async function onDeviceStatus(id: string, status: DeviceStatus) {
  await DeviceModel.updateOne(
    { _id: new Types.ObjectId(id) },
    { $set: { status: status } },
  );
}

async function onDeviceHeartbeat(id: string) {
  await DeviceModel.updateOne(
    { _id: new Types.ObjectId(id) },
    { $set: { status: DeviceStatus.Online, heartbeatAt: new Date() } },
  );
}

async function onDeviceMessage(
  id: string,
  prop: string | undefined,
  data?: unknown,
) {
  try {
    switch (prop) {
      case "status":
        await onDeviceStatus(
          id,
          data ? DeviceStatus.Online : DeviceStatus.Offline,
        );
        break;
      case "heartbeat":
        await onDeviceHeartbeat(id);
        break;
      case "fetch":
        sendDeviceResponse(id, data);
        break;
      case undefined:
        throw BadRequest("Null prop");
    }
  } catch (err) {
    console.error("device message error", err);
  }
}

async function onMessage(topic: string, payload: Buffer) {
  try {
    const ts = topic.split("/");
    if (ts.length !== 3) throw BadRequest("Invalid topic");

    const ps = payload.toString("utf-8");

    const data: unknown | undefined = ps ? JSON.parse(ps) : undefined;

    switch (ts[0]) {
      case "device": {
        await onDeviceMessage(ts[1], ts[2], data);
        break;
      }
      case undefined: {
        throw BadRequest("Null topic");
      }
    }
  } catch (err) {
    console.error("mqtt message error", err);
  }
}
