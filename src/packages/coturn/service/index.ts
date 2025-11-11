import { createHmac } from "crypto";
import moment from "moment";
import { InternalServerError } from "../../core";
import { InputId } from "../../core/model";

export function readCoturnUser(user: InputId) {
  if (!process.env.COTURN_SECRET) {
    throw InternalServerError("Must set COTURN_SECRET");
  }

  const time = moment().add(24, "hour").unix();
  const tu = `${time}:${user.toString()}`;

  const hmac = createHmac("sha1", process.env.COTURN_SECRET);
  hmac.update(tu);
  const tp = hmac.digest("base64");

  return { username: tu, password: tp };
}
