import { scheduleJob } from "node-schedule";
import { WebSocket } from "ws";
import { checkDeviceKey, readDevice } from ".";
import { sleep } from "../../../utils/sleep";
import { Forbidden } from "../../core";
import { InputId } from "../../core/model";

const userWss = new Map<string, WebSocket>();
const deviceWss = new Map<string, WebSocket>();

export async function useDeviceRequest(
  id: InputId,
  user: InputId,
  ws: WebSocket,
) {
  const ids = id.toString();

  // ensure ownership
  await readDevice(id, user);

  userWss.set(ids, ws);
  console.log("user ws", ids);

  ws.send(Buffer.from(JSON.stringify({ time: Date.now() }), "utf-8"), (err) => {
    if (!err) return;
    console.error("device ws send first error", id, err);
  });

  ws.on("message", (raw) => {
    const dws = deviceWss.get(ids);
    dws?.send(raw);
  });

  ws.once("close", (code, reason) => {
    userWss.delete(ids);

    console.log("user ws close", id, code, reason.toString("utf-8"));
  });
}

export async function useDeviceResponse(
  id: InputId,
  key: string,
  ws: WebSocket,
) {
  const ids = id.toString();

  const dke = await checkDeviceKey(id, key);
  if (!dke) throw Forbidden();

  deviceWss.set(ids, ws);
  console.log("device ws", ids);

  ws.on("message", (raw) => {
    const uws = userWss.get(ids);
    uws?.send(raw);
  });

  ws.once("close", (code, reason) => {
    deviceWss.delete(ids);

    console.log("device ws close", id, code, reason.toString("utf-8"));
  });
}

async function wssPing() {
  try {
    console.log("wss ping job start", new Date());

    // ping users
    for (const [id, ws] of userWss) {
      if (
        ws.readyState == WebSocket.CLOSING ||
        ws.readyState == WebSocket.CLOSED
      ) {
        userWss.delete(id);
        return;
      }

      ws.ping(undefined, undefined, (err) => {
        if (!err) return;
        console.error("user ws ping error", id, err);
      });
    }

    // ping devices
    for (const [id, ws] of deviceWss) {
      if (
        ws.readyState == WebSocket.CLOSING ||
        ws.readyState == WebSocket.CLOSED
      ) {
        deviceWss.delete(id);
        return;
      }

      ws.ping(undefined, undefined, (err) => {
        if (!err) return;
        console.error("devices ws ping error", id, err);
      });
    }

    // console.log("wss ping job end");
  } catch (err) {
    console.error("wss ping job error", err);
  }

  await sleep(1000);
}

export function startWssPingJob() {
  scheduleJob("0 * * * * *", wssPing);
}
