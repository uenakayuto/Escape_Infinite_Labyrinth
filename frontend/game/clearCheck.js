import { OBJECT_SIZE } from "./setting.js";
import { SCREEN_BOUNDS } from "../util/fontsize.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function clearCheck(board) {
  const { player, key: keyItem, goal, blocks, enemies } = board;

  // 座標を「障害物」に変換
  const occupied = new Set();
  for (const b of blocks) occupied.add(`${b.pos.x},${b.pos.y}`);
  for (const e of enemies) occupied.add(`${e.pos.x},${e.pos.y}`); // 敵も障害物扱い

  const minX = OBJECT_SIZE;
  const maxX = drawW - 2 * OBJECT_SIZE;
  const minY = OBJECT_SIZE;
  const maxY = drawH - 2 * OBJECT_SIZE;

  function bfs(start, target) {
    const queue = [start.pos];
    const visited = new Set([`${start.pos.x},${start.pos.y}`]);

    const dirs = [
      { dx: OBJECT_SIZE, dy: 0 },
      { dx: -OBJECT_SIZE, dy: 0 },
      { dx: 0, dy: OBJECT_SIZE },
      { dx: 0, dy: -OBJECT_SIZE },
    ];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      if (x === target.pos.x && y === target.pos.y) return true;

      for (const { dx, dy } of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        // 探索範囲内かどうかを追加
        if (
          nx >= minX && nx < maxX &&
          ny >= minY && ny < maxY &&
          !visited.has(key) &&
          !occupied.has(key)
        ) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    return false;
  }

  // player → key, key → goal の両方到達可能かチェック
  return bfs(player, keyItem) && bfs(keyItem, goal);
}
