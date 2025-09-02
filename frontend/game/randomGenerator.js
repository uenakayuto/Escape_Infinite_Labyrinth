import { SCREEN_BOUNDS } from "../util/fontsize.js";
import { OBJECT_SIZE, QUANTITY_LIMIT, PLAYER_SPEED } from "./setting.js";
import { clearCheck } from "./clearCheck.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function generateInitialBoard() {

  const occupied = new Set();

  // 数量制限をカウントする辞書
  const countX = { block: {}, enemy: {} };
  const countY = { block: {}, enemy: {} };

  function canPlaceBlock(x, y) {
    const xi = x, yi = y;

    // X制限
    if ((countX.block[xi] || 0) >= QUANTITY_LIMIT.XBLOCK) return false;
    // Y制限
    if ((countY.block[yi] || 0) >= QUANTITY_LIMIT.YBLOCK) return false;

    return true;
  }

  function canPlaceEnemy(x, y, axis, player, key, goal, blocks) {
    const xi = x, yi = y;

    // X制限
    if ((countX.enemy[xi] || 0) >= QUANTITY_LIMIT.XENEMY) return false;
    // Y制限
    if ((countY.enemy[yi] || 0) >= QUANTITY_LIMIT.YENEMY) return false;

    // 5: 垂直移動の敵がプレイヤ/鍵/ゴールとX座標一致しブロック遮蔽なし
    if (axis === 1) {
      for (const target of [player, key, goal]) {
        if (target && target.pos.x === x) {
          if (!hasBlockBetween(x, y, target.pos.y, blocks, "y")) return false;
        }
      }
    }

    // 6: 水平移動の敵がプレイヤ/鍵/ゴールとY座標一致しブロック遮蔽なし
    if (axis === 0) {
      for (const target of [player, key, goal]) {
        if (target && target.pos.y === y) {
          if (!hasBlockBetween(y, x, target.pos.x, blocks, "x")) return false;
        }
      }
    }

    return true;
  }

  // ブロックで視線が遮られているかを確認
  function hasBlockBetween(constant, a, b, blocks, axis) {
    const [min, max] = [Math.min(a, b), Math.max(a, b)];
    for (const block of blocks) {
      if (axis === "y" && block.pos.x === constant && block.pos.y > min && block.pos.y < max) {
        return true;
      }
      if (axis === "x" && block.pos.y === constant && block.pos.x > min && block.pos.x < max) {
        return true;
      }
    }
    return false;
  }

  function getRandomPosition() {
    const cols = Math.floor(drawW / OBJECT_SIZE) - 2;
    const rows = Math.floor(drawH / OBJECT_SIZE) - 2;

    const xIndex = Math.floor(Math.random() * cols) + 1;
    const yIndex = Math.floor(Math.random() * rows) + 1;

    const x = xIndex * OBJECT_SIZE;
    const y = yIndex * OBJECT_SIZE;

    const key = `${x},${y}`;
    if (!occupied.has(key)) {
      occupied.add(key);
      return { x, y };
    } else {
      return getRandomPosition();
    }
  }

  while (true) {
    // --- 全配置を試す ---
    occupied.clear();
    Object.keys(countX.block).forEach(k => delete countX.block[k]);
    Object.keys(countY.block).forEach(k => delete countY.block[k]);
    Object.keys(countX.enemy).forEach(k => delete countX.enemy[k]);
    Object.keys(countY.enemy).forEach(k => delete countY.enemy[k]);

    const player = {
      pos: getRandomPosition(),
      dir: null,
      speed: PLAYER_SPEED
    };
    const keyItem = { pos: getRandomPosition() };
    const goal = { pos: getRandomPosition() };

    const blocks = [];
    for (let i = 0; i < QUANTITY_LIMIT.BLOCKS; i++) {
      let pos;
      do {
        pos = getRandomPosition();
      } while (!canPlaceBlock(pos.x, pos.y));
      blocks.push({ pos });
      countX.block[pos.x] = (countX.block[pos.x] || 0) + 1;
      countY.block[pos.y] = (countY.block[pos.y] || 0) + 1;
    }

    const enemies = [];
    for (let i = 0; i < QUANTITY_LIMIT.ENEMIES; i++) {
      let pos, axis, dir;
      do {
        pos = getRandomPosition();
        axis = Math.floor(Math.random() * 2); // 0: 水平, 1: 垂直
        dir = Math.floor(Math.random() * 2); // 0: 右/下, 1: 左/上
      } while (!canPlaceEnemy(pos.x, pos.y, axis, player, keyItem, goal, blocks));

      const speed = Math.floor(Math.random() * 5) + 2;

      enemies.push({ pos, axis, dir, speed });
      countX.enemy[pos.x] = (countX.enemy[pos.x] || 0) + 1;
      countY.enemy[pos.y] = (countY.enemy[pos.y] || 0) + 1;
    }

    const board = {
      player,
      key: keyItem,
      goal,
      blocks,
      enemies,
    };

    // --- 7. clearCheck ---
    if (clearCheck(board)) {
      return board;
    }
    // 失敗なら while でやり直し
  }
}