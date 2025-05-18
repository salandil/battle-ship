import { WebSocket } from "ws";

export type Player = {
  id: string;
  name: string;
  password: string;
  webSocket: WebSocket;
};

export type Room = {
  id: string;
  player1: {
    id: string;
    name: string;
  };
  player2?: {
    id: string;
    name: string;
  };
};

export enum ShipType {
  small = "small",
  medium = "medium",
  large = "large",
  huge = "huge",
}

export type Ship = {
  type: ShipType;
  direction: boolean;
  length: number;
  position: {
    x: number;
    y: number;
  };
};

export type GamePlayer = {
  id: string;
  ships: Ship[];
  map: number[][];
};

export type Game = {
  id: string;
  playerTurn: string;
  players: GamePlayer[];
};

export type PlayerData = Omit<Player, "id">;

export enum PointType {
  empty = 1,
  ship = 2,
  shot = 3,
  miss = 4,
}

export type WinnerPlayer = {
  name: string,
  wins: number,
}
