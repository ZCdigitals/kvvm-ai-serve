// must be the first import
import "../config";
// start the server
import { gracefulShutdown } from "node-schedule";
import app from "../app";

// use port
const port: number = parseInt(process.env.PORT ?? "3000");

// create server
const server = app.listen(port);
server.on("listening", () => {
  console.log("Server is listening", "Port", port);
});
server.on("close", () => {
  console.log("Server close");
});
server.on("error", (err: { syscall: string; code: unknown }) => {
  const { syscall, code } = err;
  if (syscall !== "listen") {
    console.error("Not listen error", err);
  } else {
    switch (code) {
      case "EACCES":
        console.error("Port", port, "requires elevated privileges");
        break;
      case "EADDRINUSE":
        console.error("Port", port, "is already in use");
        break;
      default:
        console.error("Listen error", err);
    }
  }
  process.exit(1);
});

function close() {
  server.close((err) => {
    if (!err) return;
    console.error("server close error", err);
    process.exitCode = 1;
  });
  gracefulShutdown().catch((err) => {
    if (!err) return;
    console.error("job stop error", err);
    process.exitCode = 2;
  });
}

// close on signal
process.on("SIGTERM", close);
process.on("SIGINT", close);
