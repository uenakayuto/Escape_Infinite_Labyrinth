import { SCREEN_BOUNDS } from "../util/fontsize.js";
import { OBJECT_SIZE, DIFF_OBJECT } from "./setting.js";
import { gameState } from "./game.js";

const getKeyItemSE = new Audio('./resource/se/get_key.ogg');

const goalSE = new Audio('./resource/se/goal.ogg');

const gameOverSE = new Audio('./resource/se/game_over.ogg');

const { drawW, drawH } = SCREEN_BOUNDS;

export function gameLogic(board, pressedKeys, deltaTime) {
  const { player, key: keyItem, goal, blocks, enemies } = board;

  let newX = player.pos.x;
  let newY = player.pos.y;

  let axis = null;
  let dir = null;

  const playerMoveDistance = player.speed * deltaTime / 16.67; // 60FPS基準の移動量

  // プレイヤーの移動処理
  if (pressedKeys.up) {newY -= playerMoveDistance; axis = 1; dir = 1;}
  if (pressedKeys.down) {newY += playerMoveDistance; axis = 1; dir = 0;}
  if (pressedKeys.left) {newX -= playerMoveDistance; axis = 0; dir = 1;}
  if (pressedKeys.right) {newX += playerMoveDistance; axis = 0; dir = 0;}

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

    const enemyMoveDistance = speed * deltaTime / 16.67; // 60FPS基準の移動量

    // 移動量計算
    if (axis === 0) newX += (dir === 0 ? enemyMoveDistance : -enemyMoveDistance);
    else newY += (dir === 0 ? enemyMoveDistance : -enemyMoveDistance);

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

      if (Math.abs(e1.pos.x - e2.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
          Math.abs(e1.pos.y - e2.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {

        if (e1.axis !== e2.axis) {
          // --- 軸が異なる場合の厳密判定 ---
          const dx = Math.abs(e1.originalPos.x - e2.originalPos.x);
          const dy = Math.abs(e1.originalPos.y - e2.originalPos.y);

          if (dx < OBJECT_SIZE - 2 * DIFF_OBJECT) {
            // 縦方向でほぼ重なっている → 縦に動く敵のみ反転
            if (e1.axis === 1) {
              e1.pos.y = e1.dir === 0 ? e2.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e1.dir = e1.dir === 0 ? 1 : 0;
            } else {
              e2.pos.y = e2.dir === 0 ? e1.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e2.dir = e2.dir === 0 ? 1 : 0;
            }
          } else if (dy < OBJECT_SIZE - 2 * DIFF_OBJECT) {
            // 横方向でほぼ重なっている → 横に動く敵のみ反転
            if (e1.axis === 0) {
              e1.pos.x = e1.dir === 0 ? e2.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e1.dir = e1.dir === 0 ? 1 : 0;
            } else {
              e2.pos.x = e2.dir === 0 ? e1.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e2.dir = e2.dir === 0 ? 1 : 0;
            }
          } else {
            const commonDivisor = gcd(e1.speed, e2.speed);
            const e1EffectiveSpeed = e1.speed / commonDivisor;
            const e2EffectiveSpeed = e2.speed / commonDivisor;

            if (e1.axis === 0) {
              const canMoveE1 = (dx - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e1EffectiveSpeed;
              const canMoveE2 = (dy - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e2EffectiveSpeed;
              if (canMoveE1 < canMoveE2) {
                e1.pos.x = e1.dir === 0 ? e1.originalPos.x + e1EffectiveSpeed * canMoveE2 : e1.originalPos.x - e1EffectiveSpeed * canMoveE2;
                e2.pos.y = e2.dir === 0 ? e1.originalPos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.originalPos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e2.dir = e2.dir === 0 ? 1 : 0;
              } else if (canMoveE2 < canMoveE1) {
                e2.pos.y = e2.dir === 0 ? e2.originalPos.y + e2EffectiveSpeed * canMoveE1 : e2.originalPos.y - e2EffectiveSpeed * canMoveE1;
                e1.pos.x = e1.dir === 0 ? e2.originalPos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.originalPos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e1.dir = e1.dir === 0 ? 1 : 0;
              } else {
                e1.pos.x = e1.dir === 0 ? e1.originalPos.x + e1EffectiveSpeed * canMoveE1 : e1.originalPos.x - e1EffectiveSpeed * canMoveE1;
                e2.pos.y = e2.dir === 0 ? e2.originalPos.y + e2EffectiveSpeed * canMoveE2 : e2.originalPos.y - e2EffectiveSpeed * canMoveE2;
                e1.dir = e1.dir === 0 ? 1 : 0;
                e2.dir = e2.dir === 0 ? 1 : 0;
              }
            } else {
              const canMoveE1 = (dy - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e1EffectiveSpeed;
              const canMoveE2 = (dx - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e2EffectiveSpeed;
              if (canMoveE1 < canMoveE2) {
                e1.pos.y = e1.dir === 0 ? e1.originalPos.y + e1EffectiveSpeed * canMoveE2 : e1.originalPos.y - e1EffectiveSpeed * canMoveE2;
                e2.pos.x = e2.dir === 0 ? e1.originalPos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.originalPos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e2.dir = e2.dir === 0 ? 1 : 0;
              } else if (canMoveE2 < canMoveE1) {
                e2.pos.x = e2.dir === 0 ? e2.originalPos.x + e2EffectiveSpeed * canMoveE1 : e2.originalPos.x - e2EffectiveSpeed * canMoveE1;
                e1.pos.y = e1.dir === 0 ? e2.originalPos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.originalPos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e1.dir = e1.dir === 0 ? 1 : 0;
              } else {
                e1.pos.y = e1.dir === 0 ? e1.originalPos.y + e1EffectiveSpeed * canMoveE1 : e1.originalPos.y - e1EffectiveSpeed * canMoveE1;
                e2.pos.x = e2.dir === 0 ? e2.originalPos.x + e2EffectiveSpeed * canMoveE2 : e2.originalPos.x - e2EffectiveSpeed * canMoveE2;
                e1.dir = e1.dir === 0 ? 1 : 0;
                e2.dir = e2.dir === 0 ? 1 : 0;
              }
            }
          }
        } else if (e1.dir !== e2.dir) {
          const commonDivisor = gcd(e1.speed, e2.speed);
          const e1EffectiveSpeed = e1.speed / commonDivisor;
          const e2EffectiveSpeed = e2.speed / commonDivisor;
          if (e1.axis === 0) {
            const dx = Math.abs(e1.originalPos.x - e2.originalPos.x);
            const canMove = (dx - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / (e1EffectiveSpeed + e2EffectiveSpeed);
            e1.pos.x = e1.dir === 0 ? e1.originalPos.x + e1EffectiveSpeed * canMove : e1.originalPos.x - e1EffectiveSpeed * canMove;
            e2.pos.x = e2.dir === 0 ? e2.originalPos.x + e2EffectiveSpeed * canMove : e2.originalPos.x - e2EffectiveSpeed * canMove;
          } else {
            const dy = Math.abs(e1.originalPos.y - e2.originalPos.y);
            const canMove = (dy - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / (e1EffectiveSpeed + e2EffectiveSpeed);
            e1.pos.y = e1.dir === 0 ? e1.originalPos.y + e1EffectiveSpeed * canMove : e1.originalPos.y - e1EffectiveSpeed * canMove;
            e2.pos.y = e2.dir === 0 ? e2.originalPos.y + e2EffectiveSpeed * canMove : e2.originalPos.y - e2EffectiveSpeed * canMove;
          }
          e1.dir = e1.dir === 0 ? 1 : 0;
          e2.dir = e2.dir === 0 ? 1 : 0;
        } else {
          if (e1.speed > e2.speed) {
            if (e1.axis === 0) {
              e1.pos.x = e1.dir === 0 ? e2.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
            } else {
              e1.pos.y = e1.dir === 0 ? e2.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
            }
            e1.dir = e1.dir === 0 ? 1 : 0;
          } else if (e2.speed > e1.speed) {
            if (e2.axis === 0) {
              e2.pos.x = e2.dir === 0 ? e1.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
            } else {
              e2.pos.y = e2.dir === 0 ? e1.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
            }
            e2.dir = e2.dir === 0 ? 1 : 0;
          } else {
            e1.dir = e1.dir === 0 ? 1 : 0;
            e2.dir = e2.dir === 0 ? 1 : 0;
            e1.pos = { ...e1.originalPos };
            e2.pos = { ...e2.originalPos };
          }
        }
      }
    }
  }

  if (!gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - keyItem.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
        Math.abs(player.pos.y - keyItem.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {
      gameState.isHoldingKeyItem = true;
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
    }
  }

  if (gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - goal.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
        Math.abs(player.pos.y - goal.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {
      gameState.isGoal = true;
      goalSE.currentTime = 0;
      goalSE.play();
    }
  }

  if (!gameState.isGoal){
    if (isCollidingWithEnemies(player.pos.x, player.pos.y, newEnemies)) {
      gameState.isGameOver = true;
      gameOverSE.currentTime = 0;
      gameOverSE.play();
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
  if (x > drawW - OBJECT_SIZE - (OBJECT_SIZE - 2 * DIFF_OBJECT)) {
    x = drawW - OBJECT_SIZE - (OBJECT_SIZE - 2 * DIFF_OBJECT);
    dir = 1;
    return { x, y, dir };
  }
  if (y < OBJECT_SIZE) {
    y = OBJECT_SIZE;
    dir = 0;
    return { x, y, dir };
  }
  if (y > drawH - OBJECT_SIZE - (OBJECT_SIZE - 2 * DIFF_OBJECT)) {
    y = drawH - OBJECT_SIZE - (OBJECT_SIZE - 2 * DIFF_OBJECT);
    dir = 1;
    return { x, y, dir };
  }

  // ブロックとの判定
  for (const block of blocks) {
    if (Math.abs(x - DIFF_OBJECT - block.pos.x) < OBJECT_SIZE - DIFF_OBJECT &&
        Math.abs(y - DIFF_OBJECT - block.pos.y) < OBJECT_SIZE - DIFF_OBJECT) {
      
      // axisとdirを考慮して補正
      if (axis === 0) { // 横方向移動中
        if (dir === 0) { // 右移動
          x = block.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT);
          dir = 1;
          return { x, y, dir };
        } else { // 左移動
          x = block.pos.x + OBJECT_SIZE;
          dir = 0;
          return { x, y, dir };
        }
      } else { // 縦方向移動中
        if (dir === 0) { // 下移動
          y = block.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT);
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
  return enemies.some(enemy => Math.abs(x - enemy.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
                                Math.abs(y - enemy.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT);
}

function gcd(speed1, speed2) {
  return speed2 === 0 ? speed1 : gcd(speed2, speed1 % speed2);
}
