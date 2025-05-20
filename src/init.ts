import { WebSocketServer } from "ws";
import { DEFAULT_PORT } from "./helpers/helper";
import { App } from "./app";
import { GameDb } from "./game/game.db";
import { EOL } from "node:os";

const PORT = Number(process.env["PORT"]) || DEFAULT_PORT;
const webSocketServer = new WebSocketServer({ port: PORT });
const gameDb = new GameDb();

console.log(`${EOL}Websocket parameters:`);
console.log(`URL: ws://localhost:${PORT}`);
console.log(`Port: ${PORT}`);
console.log(`Protocol: ws${EOL}`);

webSocketServer.on("connection", (ws) => {
  ws.on("message", (data) => {
    App(ws, data, gameDb);
  });
});

process.on("SIGINT", async () => {
  const conns = await gameDb.getUserConnections();
  conns.forEach((conn) => conn.close());
  webSocketServer.close();
});
