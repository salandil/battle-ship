import { GameDb } from "../game/game.db";
import { type WebSocket } from "ws";
import { sendResponse } from "./send.messege";
import { RequestType } from "./types";

export const updateWinners = async (gameDb: GameDb) => {
  const webSockets = await gameDb.getUserConnections();
  const winnerList = await gameDb.getWinners();

  webSockets.forEach((webSocket: WebSocket) => {
    sendResponse(webSocket, RequestType.update_winners, winnerList);
  });
};
