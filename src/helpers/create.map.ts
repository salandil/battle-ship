import { PointType, Ship } from "../game/game.type";

export const createMap = (ships: Ship[]) => {
  const map = new Array(10)
    .fill(PointType.empty)
    .map(() => new Array(10).fill(1));

  ships.forEach((ship) => {
    const { position, direction, length } = ship;
    const { x, y } = position;
    for (let i = 0; i < length; i++) {
      const point = !direction ? [x + i, y] : [x, y + i];
      map[point[0]][point[1]] = PointType.ship;
    }
  });

  return map;
};
