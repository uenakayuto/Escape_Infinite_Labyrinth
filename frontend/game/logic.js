import { SCREEN_BOUNDS } from "../util/fontsize.js";
import { OBJECT_SIZE } from "./setting.js";
import { gameState } from "./game.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function gameLogic(board, pressedKeys) {
  const { player, key: keyItem, goal, blocks, enemies } = board;

  let newX = player.pos.x;
  let newY = player.pos.y;

  let axis = null;
  let dir = null;

  // プレイヤーの移動処理
  if (pressedKeys.up) {newY -= player.speed; axis = 1; dir = 1;}
  if (pressedKeys.down) {newY += player.speed; axis = 1; dir = 0;}
  if (pressedKeys.left) {newX -= player.speed; axis = 0; dir = 1;}
  if (pressedKeys.right) {newX += player.speed; axis = 0; dir = 0;}

  if (axis !== null && dir !== null) {
    const resolvedPos = resolveCollision(newX, newY, axis, dir, blocks);
    player.pos = { x: resolvedPos.x, y: resolvedPos.y };
  }

  // まず敵の移動後の新しい座標を計算
  const newEnemies = enemies.map(enemy => {
    let { pos, axis, dir, speed } = enemy;
    const originalPos = { ...pos }; // ← ブロック衝突前の座標を保持
    let newX = pos.x;
    let newY = pos.y;

    // 移動量計算
    if (axis === 0) newX += (dir === 0 ? speed : -speed);
    else newY += (dir === 0 ? speed : -speed);

    // 衝突したら座標は元の位置に戻す（ブロック衝突判定前ではなく移動前の originalPos に戻す）
    const resolvedPos = resolveCollision(newX, newY, axis, dir, blocks);
    newX = resolvedPos.x;
    newY = resolvedPos.y;
    dir = resolvedPos.dir;

    return { ...enemy, pos: { x: newX, y: newY }, dir, originalPos };
  });

  // 敵同士の衝突判定
  for (let i = 0; i < newEnemies.length; i++) {
    for (let j = i + 1; j < newEnemies.length; j++) {
      const e1 = newEnemies[i];
      const e2 = newEnemies[j];

      if (Math.abs(e1.pos.x - e2.pos.x) < OBJECT_SIZE &&
          Math.abs(e1.pos.y - e2.pos.y) < OBJECT_SIZE) {

        if (e1.axis !== e2.axis || e1.dir !== e2.dir) {
          e1.dir = e1.dir === 0 ? 1 : 0;
          e2.dir = e2.dir === 0 ? 1 : 0;
        } else {
          if (e1.speed > e2.speed) e1.dir = e1.dir === 0 ? 1 : 0;
          else if (e2.speed > e1.speed) e2.dir = e2.dir === 0 ? 1 : 0;
          else {
            e1.dir = e1.dir === 0 ? 1 : 0;
            e2.dir = e2.dir === 0 ? 1 : 0;
          }
        }

        // 衝突後に戻す座標はブロック衝突前の originalPos を使用
        e1.pos = { ...e1.originalPos };
        e2.pos = { ...e2.originalPos };
      }
    }
  }

  if (!gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - keyItem.pos.x) < OBJECT_SIZE &&
        Math.abs(player.pos.y - keyItem.pos.y) < OBJECT_SIZE) {
      gameState.isHoldingKeyItem = true;
    }
  }

  if (gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - goal.pos.x) < OBJECT_SIZE &&
        Math.abs(player.pos.y - goal.pos.y) < OBJECT_SIZE) {
      gameState.isGoal = true;
    }
  }

  if (!gameState.isGoal){
    if (isCollidingWithEnemies(player.pos.x, player.pos.y, newEnemies)) {
      gameState.isGameOver = true;
    }
  }

  return {
    player,
    key: keyItem,
    goal,
    blocks,
    enemies: newEnemies,
  };
}

function resolveCollision(x, y, axis, dir, blocks) {
  // まず壁との判定
  if (x < OBJECT_SIZE) {
    x = OBJECT_SIZE;
    dir = 0;
    return { x, y, dir };
  }
  if (x > drawW - 2 * OBJECT_SIZE) {
    x = drawW - 2 * OBJECT_SIZE;
    dir = 1;
    return { x, y, dir };
  }
  if (y < OBJECT_SIZE) {
    y = OBJECT_SIZE;
    dir = 0;
    return { x, y, dir };
  }
  if (y > drawH - 2 * OBJECT_SIZE) {
    y = drawH - 2 * OBJECT_SIZE;
    dir = 1;
    return { x, y, dir };
  }

  // ブロックとの判定
  for (const block of blocks) {
    if (Math.abs(x - block.pos.x) < OBJECT_SIZE &&
        Math.abs(y - block.pos.y) < OBJECT_SIZE) {
      
      // axisとdirを考慮して補正
      if (axis === 0) { // 横方向移動中
        if (dir === 0) { // 右移動
          x = block.pos.x - OBJECT_SIZE;
          dir = 1;
          return { x, y, dir };
        } else { // 左移動
          x = block.pos.x + OBJECT_SIZE;
          dir = 0;
          return { x, y, dir };
        }
      } else { // 縦方向移動中
        if (dir === 0) { // 下移動
          y = block.pos.y - OBJECT_SIZE;
          dir = 1;
          return { x, y, dir };
        } else { // 上移動
          y = block.pos.y + OBJECT_SIZE;
          dir = 0;
          return { x, y, dir };
        }
      }
    }
  }

  return { x, y, dir };
}

function isCollidingWithEnemies(x, y, enemies) {
  return enemies.some(enemy => Math.abs(x - enemy.pos.x) < OBJECT_SIZE &&
                                Math.abs(y - enemy.pos.y) < OBJECT_SIZE);
}