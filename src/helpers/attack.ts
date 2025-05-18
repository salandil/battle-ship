import { GameDb } from "../game/game.db";
import { PointType } from "../game/game.type";
import { getAttackStatus } from "./attack.status";
import { getRandomAttackPoints } from "./random-attack";
import { sendResponse } from "./send.messege";
import { MessageBody, RequestType } from "./types";
import { type WebSocket } from "ws";
import { updateWinners } from "./update.winners";

export const attack = async (
  gameDb: GameDb,
  webSocket: WebSocket,
  body: MessageBody
) => {
  const { gameId, indexPlayer } = body.data;
  let points: { x: number; y: number };
  let status = "miss";
  let shot = false;

  try {
    const game = await gameDb.getGame(gameId);

    if (!game || game.playerTurn !== indexPlayer) return;

    const player1 = await gameDb.getPlayerById(indexPlayer);
    const player2 = game.players.find((player) => player.id !== indexPlayer);
    const map = player2.map;
    const player2Data = await gameDb.getPlayerById(player2.id);

    if (body.type === RequestType.attack) {
      points = { x: body.data.x, y: body.data.y };
    } else if (body.type === RequestType.random_attack) {
      points = getRandomAttackPoints(map);
    } else {
      return;
    }

    if (
      map[points.x][points.y] === PointType.miss ||
      map[points.x][points.y] === PointType.shot
    ) {
      await gameDb.setTurn(gameId, player2.id);
      const turnMessage = { currentPlayer: player2.id };
      sendResponse(webSocket, RequestType.turn, turnMessage);
      sendResponse(player2Data.webSocket, RequestType.turn, turnMessage);
      console.log(`${body.type}: Player "${player1.name}" shot into attacked point. Subsequent player's turn`);
      return;
    }

    if (map[points.x][points.y] === PointType.ship) {
      status = "shot";
      map[points.x][points.y] = PointType.shot;
      shot = true;
    } else {
      status = "miss";
      map[points.x][points.y] = PointType.miss;
    }
    if (shot) {
      const res = getAttackStatus(points.x, points.y, map, player2.ships);
      status = res.status;

      if (res.points?.pointsAround) {
        res.points.pointsAround.forEach((point) => {
          const response = {
            position: { x: point.x, y: point.y },
            currentPlayer: indexPlayer,
            status: "miss",
          };

          if (map[point.x][point.y] === PointType.empty) {
            map[point.x][point.y] = PointType.miss;
            sendResponse(webSocket, RequestType.attack, response);
            sendResponse(player2Data.webSocket, RequestType.attack, response);
          }
        });
      }
      if (res.points?.pointsShip) {
        res.points?.pointsShip.forEach((cell) => {
          const response = {
            position: { x: cell.x, y: cell.y },
            currentPlayer: indexPlayer,
            status: "killed",
          };
          sendResponse(webSocket, RequestType.attack, response);
          sendResponse(player2Data.webSocket, RequestType.attack, response);
        });
      }
    }

    await gameDb.updateMap(gameId, player2.id, map);

    const message = {
      position: points,
      currentPlayer: indexPlayer,
      status: status,
    };

    sendResponse(webSocket, RequestType.attack, message);
    sendResponse(player2Data.webSocket, RequestType.attack, message);
    console.log(`${body.type}: Player "${player1.name}" attacked point x:${points.x}, y:${points.y}. Attack result: ${status}`);

    let healthyShip = false;
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        if (map[j][i] === PointType.ship) {
          healthyShip = true;
        }
      }
    }
    if (!healthyShip) {
      await gameDb.setWinnerScore(indexPlayer);
      const response = { winPlayer: indexPlayer };
      sendResponse(webSocket, RequestType.finish, response);
      sendResponse(player2Data.webSocket, RequestType.finish, response);
      console.log(`${RequestType.finish}: Player "${player1.name}" wins! Player "${player2Data.name}" loser!`);
      await updateWinners(gameDb);
      return;
    }

    const nextPlayerId = shot ? indexPlayer : player2.id;
    const turnMessage = { currentPlayer: nextPlayerId };
    await gameDb.setTurn(gameId, nextPlayerId);

    sendResponse(webSocket, RequestType.turn, turnMessage);
    sendResponse(player2Data.webSocket, RequestType.turn, turnMessage);
  } catch (err) {
    console.log(err);
  }
};
