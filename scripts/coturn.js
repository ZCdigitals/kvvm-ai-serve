const crypto = require("crypto");
const moment = require("moment");

function main() {
  const user = "6572ae0d8b777fac2a34f4e9";

  const time = moment().add(24, "hour").unix();
  const tu = `${time}:${user.toString()}`;

  const hmac = crypto.createHmac("sha1", "thisisaverylongcoturnsecret");
  hmac.update(tu);
  const tp = hmac.digest("base64");

  console.log("coturn user", tu, tp);
}

main();
