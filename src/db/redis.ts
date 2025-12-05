import { createClient } from "redis";

export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
  },
});

redis.on("ready", () => {
  console.log("redis client ready", new Date());
});
redis.on("end", () => {
  console.log("redis client end", new Date());
});
redis.on("error", (err) => {
  console.error("redis client error", err);
});
// redis.connect();

function close() {
  if (!redis.isOpen) return;
  redis.destroy();
}

// close on signal
process.on("SIGTERM", close);
process.on("SIGINT", close);
