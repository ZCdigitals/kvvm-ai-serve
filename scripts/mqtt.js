const mqtt = require("mqtt");
const crypto = require("crypto");

const MQTT_BROKER_URL = "mqtt://admin:admin12345@localhost:1883";
const deviceId = "68bd5a459cc32b1b05085edc";

function main() {
  const u = new URL(MQTT_BROKER_URL);

  const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `server-${crypto.randomUUID()}`,
    username: u.username,
    password: u.password,
    clean: true,
    reconnectPeriod: 1000,
  });

  function sendOnline() {
    publish("status", JSON.stringify(true));
  }

  function publish(prop, payload) {
    const topic = `device/${deviceId}/${prop}`;
    client.publish(topic, payload);

    console.log("publish", prop, payload);
  }

  client.on("connect", () => {
    console.log("mqtt connected");

    sendOnline();
  });

  client.on("error", (err) => {
    console.error("mqtt error", err);
    process.exit(1);
  });

  client.on("close", () => {
    console.log("mqtt disconnected");
  });

  const close = () => {
    client.end();
  };

  process.on("SIGTERM", close);
  process.on("SIGINT", close);
}

main();
