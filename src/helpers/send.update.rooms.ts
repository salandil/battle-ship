import { GameDb } from "../game/game.db";
import { type WebSocket } from "ws";
import { sendResponse } from "./send.messege";
import { RequestType } from "./types";

export const updateRooms = async (gameDb: GameDb) => {
  const webSockets = await gameDb.getUserConnections();
  const freeRooms = await gameDb.getFreeRooms();

  webSockets.forEach((webSocket: WebSocket) => {
    sendResponse(webSocket, RequestType.update_room, freeRooms);
  });
};
