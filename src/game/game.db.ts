import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";
import type {
  Game,
  Player,
  PlayerData,
  Room,
  Ship,
  WinnerPlayer,
} from "./game.type";
import { createMap } from "../helpers/create.map";

export class GameDb {
  players: Player[];
  rooms: Room[];
  games: Game[];
  winnerList: WinnerPlayer[];

  constructor() {
    this.players = [] as Player[];
    this.rooms = [] as Room[];
    this.games = [] as Game[];
    this.winnerList = [] as WinnerPlayer[];
  }

  async getPlayerByWs(webSocket: WebSocket) {
    return this.players.find((player) => player.webSocket === webSocket);
  }

  async getPlayerById(id: string) {
    return this.players.find((player) => player.id === id);
  }

  async getUserConnections() {
    return this.players.map((player) => player.webSocket);
  }

  async addPlayer(playerData: PlayerData) {
    const newPlayer = {
      ...playerData,
      id: uuidv4(),
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  async register(playerData: PlayerData) {
    const oldPlayer = this.players.find(
      (player) => player.name === playerData.name
    );
    if (!oldPlayer) {
      return this.addPlayer(playerData);
    }

    if (oldPlayer.password !== playerData.password) {
      return;
    }

    oldPlayer.webSocket = playerData.webSocket;
    const playerIndex = this.players.findIndex(
      (player) => player.name === playerData.name
    );
    this.players[playerIndex] = oldPlayer;
    return oldPlayer;
  }

  async createRoom(idPlayer: string) {
    const player = await this.getPlayerById(idPlayer);
    const room = {
      id: uuidv4(),
      player1: {
        id: idPlayer,
        name: player.name,
      },
    };
    this.rooms.push(room);
    return room;
  }

  async getRoom(roomId: string) {
    return this.rooms.find((room) => room.id === roomId);
  }

  async getFreeRooms() {
    const rooms = this.rooms.filter((room) => !room.player2);
    const res = rooms.map((room) => ({
      roomId: room.id,
      roomUsers: [
        {
          name: room.player1.name,
          index: room.player1.id,
        },
      ],
    }));
    return res;
  }

  async addPlayerToRoom(roomId: string, playerId: string) {
    const roomIndex = this.rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return false;
    if (
      this.rooms[roomIndex].player1.id === playerId ||
      !!this.rooms[roomIndex].player2
    )
      return false;
    const playerData = await this.getPlayerById(playerId);

    this.rooms[roomIndex].player2 = {
      id: playerData.id,
      name: playerData.name,
    };
    return true;
  }

  async createGame(player1Id: string, player2Id: string) {
    const game = {
      id: uuidv4(),
      players: [
        {
          id: player1Id,
          ships: [] as Ship[],
          map: [] as number[][],
        },
        {
          id: player2Id,
          ships: [] as Ship[],
          map: [] as number[][],
        },
      ],
      playerTurn: player1Id,
    };
    this.games.push(game);
    return game;
  }

  async getGame(gameId: string) {
    return this.games.find((game: Game) => game.id === gameId);
  }

  async getGamePlayerIndex(gameId: string, playerId: string) {
    const gameIndex = this.games.findIndex((game: Game) => game.id === gameId);
    if (gameIndex === -1) return;

    const game = this.games[gameIndex];
    const playerIndex = game.players.findIndex(
      (player) => player.id === playerId
    );
    if (playerIndex === -1) return;

    return { gameIndex, playerIndex };
  }

  async createShips(gameId: string, playerId: string, ships: Ship[]) {
    const indexes = await this.getGamePlayerIndex(gameId, playerId);
    const game = this.games[indexes.gameIndex];

    game.players[indexes.playerIndex].ships = ships;
    game.players[indexes.playerIndex].map = createMap(ships);
    return game;
  }

  async setTurn(gameId: string, playerId: string) {
    const gameIndex = this.games.findIndex((game: Game) => game.id === gameId);
    if (gameIndex === -1) return;

    this.games[gameIndex].playerTurn = playerId;
  }

  async updateMap(gameId: string, playerId: string, map: number[][]) {
    const indexes = await this.getGamePlayerIndex(gameId, playerId);

    this.games[indexes.gameIndex].players[indexes.playerIndex].map = map;
  }

  async gameIsReady(gameId: string) {
    const game = await this.getGame(gameId);
    const indexNotReadyPlayer = game.players.findIndex(
      (player) => !player.ships.length
    );
    return indexNotReadyPlayer === -1;
  }

  async getWinners() {
    return this.winnerList;
  }

  async setWinnerScore(playerId: string) {
    const player = await this.getPlayerById(playerId);
    const winnerIndex = this.winnerList.findIndex(
      (winner) => winner.name === player.name
    );
    if (winnerIndex === -1) {
      this.winnerList.push({
        name: player.name,
        wins: 1,
      });
    } else {
      this.winnerList[winnerIndex].wins += 1;
    }
  }
}
