import { PointType } from "../game/game.type";

export const getRandomAttackPoints = (map: number[][]) => {
  let points;

  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j <= 9; j++) {
      if (map[j][i] === PointType.empty || map[j][i] === PointType.ship) {
        if (!points) points = { x: j, y: i };
        break;
      }
    }
  }
  return points;
};
