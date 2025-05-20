import { RequestType } from "./types";
import { WebSocket } from "ws";

export const sendResponse = (
  webSocket: WebSocket,
  type: RequestType,
  data: any
) => {
  const message = {
    type,
    data: JSON.stringify(data),
    id: 0,
  };
  webSocket.send(JSON.stringify(message));
};
