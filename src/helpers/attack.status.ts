import { PointType, Ship } from "../game/game.type";

type Point = {
  x: number;
  y: number;
};

export const getAttackStatus = (
  x: number,
  y: number,
  map: number[][],
  ships: Ship[]
) => {
  const pointsShip: Point[] = [];
  const pointsAround: Point[] = [];

  ships.forEach((ship) => {
    if (
      !ship.direction &&
      x >= ship.position.x &&
      x <= ship.position.x + ship.length - 1 &&
      y === ship.position.y
    ) {
      pointsShip.push(
        ...new Array(ship.length)
          .fill(0)
          .map((_, i) => ({ x: ship.position.x + i, y: ship.position.y }))
      );
      for (
        let i = ship.position.x - 1;
        i <= ship.position.x + ship.length;
        i++
      ) {
        for (let j = ship.position.y - 1; j <= ship.position.y + 1; j++) {
          pointsAround.push({ x: i, y: j });
        }
      }
    } else if (
      ship.direction &&
      y >= ship.position.y &&
      y <= ship.position.y + ship.length - 1 &&
      x === ship.position.x
    ) {
      pointsShip.push(
        ...new Array(ship.length)
          .fill(0)
          .map((_, i) => ({ x: ship.position.x, y: ship.position.y + i }))
      );
      for (let i = ship.position.x - 1; i <= ship.position.x + 1; i++) {
        for (
          let j = ship.position.y - 1;
          j <= ship.position.y + ship.length;
          j++
        ) {
          pointsAround.push({ x: i, y: j });
        }
      }
    }
    return false;
  });

  const healthyPoint = pointsShip.find(
    (point) => map[point.x][point.y] === PointType.ship
  );
  if (healthyPoint) {
    return { status: "shot" };
  }

  const clearedPointsAround = pointsAround.filter(
    (point) => point.x >= 0 && point.x <= 9 && point.y >= 0 && point.y <= 9
  );

  return {
    status: "killed",
    points: { pointsShip, pointsAround: clearedPointsAround },
  };
};
