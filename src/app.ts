import type { WebSocket, RawData } from "ws";
import { parseBody } from "./helpers/parse.body";
import { RequestType } from "./helpers/types";
import { GameDb } from "./game/game.db";
import { sendResponse } from "./helpers/send.messege";
import { updateRooms } from "./helpers/send.update.rooms";
import { attack } from "./helpers/attack";
import { updateWinners } from "./helpers/update.winners";

export const App = async (
  webSocket: WebSocket,
  message: RawData,
  gameDb: GameDb
) => {
  const body = parseBody(message);
  const playerData = {
    name: body.data.name as string,
    password: body.data.password as string,
    webSocket,
  };

  try {
    switch (body.type) {
      case RequestType.reg:
        const { name, password } = playerData;
        const player = await gameDb.register({
          name: name.trim(),
          password: password.trim(),
          webSocket: playerData.webSocket,
        });
        if (!player) {
          const errorText = 'Password is wrong'
          sendResponse(webSocket, RequestType.reg, {
            index: null,
            name: name,
            error: true,
            errorText,
          });
          console.log(`${RequestType.reg} command failed with an error: ${errorText}`);
        } else {
          sendResponse(webSocket, RequestType.reg, {
            index: player.id,
            name: player.name,
          });
          console.log(`${RequestType.reg}: Player "${player.name}" registered`);
          await updateRooms(gameDb);
          await updateWinners(gameDb);
        }

        break;
      case RequestType.create_room:
        const currentPlayer = await gameDb.getPlayerByWs(webSocket);
        const room = await gameDb.createRoom(currentPlayer.id);
        if (room) {
          await updateRooms(gameDb);
          console.log(`${RequestType.create_room}: Player "${currentPlayer.name}" created a room`);
        }
        await updateWinners(gameDb);
        break;

      case RequestType.add_user_to_room:
        const { indexRoom } = body.data;
        const roomData = await gameDb.getRoom(indexRoom);
        const firstPlayer = await gameDb.getPlayerById(roomData.player1.id);
        const anotherPlayer = await gameDb.getPlayerByWs(webSocket);
        const res = await gameDb.addPlayerToRoom(indexRoom, anotherPlayer.id);
        if (res) {
          const game = await gameDb.createGame(firstPlayer.id, anotherPlayer.id);
          if (game) {
            sendResponse(webSocket, RequestType.create_game, {
              idGame: game.id,
              idPlayer: anotherPlayer.id,
            });
            sendResponse(firstPlayer.webSocket, RequestType.create_game, {
              idGame: game.id,
              idPlayer: firstPlayer.id,
            });
          }
          console.log(`${RequestType.add_user_to_room}: Player "${firstPlayer.name}" joined the room`);
          await updateRooms(gameDb);
        }
        break;

      case RequestType.add_ships:
        const { gameId, ships, indexPlayer } = body.data;

        const gameData = await gameDb.createShips(gameId, indexPlayer, ships);
        const player1 = gameData.players.find(
          (player) => player.id === indexPlayer
        );
        const player2 = gameData.players.find(
          (player) => player.id !== indexPlayer
        );
        const player1Data = await gameDb.getPlayerById(player1.id);
        const player2Data = await gameDb.getPlayerById(player2.id);
        if (!gameData) return;

        console.log(`${RequestType.add_ships}: Player "${player1Data.name}" added ships.`);
        const checkReady = await gameDb.gameIsReady(gameId);
        if (checkReady) {
          const res1 = {
            ships: player1.ships,
            currentPlayerIndex: player1.id,
          };
          const res2 = {
            ships: player2.ships,
            currentPlayerIndex: player2.id,
          };
          sendResponse(webSocket, RequestType.start_game, res1);
          sendResponse(player2Data.webSocket, RequestType.start_game, res2);

          const turnMessage = { currentPlayer: indexPlayer };
          await gameDb.setTurn(gameId, indexPlayer);

          sendResponse(webSocket, RequestType.turn, turnMessage);
          sendResponse(player2Data.webSocket, RequestType.turn, turnMessage);
          console.log(`${RequestType.start_game}: Players "${player1Data.name}" and "${player2Data.name}" started a game.`);
        }
        break;

      case RequestType.attack:
      case RequestType.random_attack:
        await attack(gameDb, webSocket, body);
        break;
    }
  } catch (error) {
    console.log(`${body.type} command failed with an error: ${error}`)
  }
};
