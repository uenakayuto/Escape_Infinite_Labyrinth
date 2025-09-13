import { SCREEN_BOUNDS } from "../util/fontsize.js";
import { OBJECT_SIZE, DIFF_OBJECT } from "./setting.js";
import { gameState } from "./game.js";

const getKeyItemSE = new Audio('./resource/se/get_key.ogg');

const goalSE = new Audio('./resource/se/goal.ogg');

const gameOverSE = new Audio('./resource/se/game_over.ogg');

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

  // 敵の移動後の新しい座標を計算
  const newEnemies = enemies.map(enemy => {
    let { pos, axis, dir, speed } = enemy;
    const originalPos = { ...pos }; // ブロック衝突前の座標を保持
    let newX = pos.x;
    let newY = pos.y;

    // 移動量計算
    if (axis === 0) newX += (dir === 0 ? speed : -speed);
    else newY += (dir === 0 ? speed : -speed);

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

      // 衝突判定
      if (Math.abs(e1.pos.x - e2.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
          Math.abs(e1.pos.y - e2.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {

        // 軸が異なる場合
        if (e1.axis !== e2.axis) {
          // x軸，y軸の差分を計算
          const dx = Math.abs(e1.originalPos.x - e2.originalPos.x);
          const dy = Math.abs(e1.originalPos.y - e2.originalPos.y);

          // 縦方向で重なっている → 縦に動く敵のみ反転
          if (dx < OBJECT_SIZE - 2 * DIFF_OBJECT) {
            // e1が縦に動く敵の場合
            if (e1.axis === 1) {
              e1.pos.y = e1.dir === 0 ? e2.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e1.dir = e1.dir === 0 ? 1 : 0;
            } 
            // e2が縦に動く敵の場合
            else {
              e2.pos.y = e2.dir === 0 ? e1.pos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e2.dir = e2.dir === 0 ? 1 : 0;
            }
          } 
          // 横方向で重なっている → 横に動く敵のみ反転
          else if (dy < OBJECT_SIZE - 2 * DIFF_OBJECT) {
            // e1が横に動く敵の場合
            if (e1.axis === 0) {
              e1.pos.x = e1.dir === 0 ? e2.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e1.dir = e1.dir === 0 ? 1 : 0;
            } 
            // e2が横に動く敵の場合
            else {
              e2.pos.x = e2.dir === 0 ? e1.pos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.pos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
              e2.dir = e2.dir === 0 ? 1 : 0;
            }
          } 
          // 重なりがない場合
          else {
            // 最大公約数を利用して有効速度を計算
            const commonDivisor = gcd(e1.speed, e2.speed);
            const e1EffectiveSpeed = e1.speed / commonDivisor;
            const e2EffectiveSpeed = e2.speed / commonDivisor;

            if (e1.axis === 0) {
              // 有効速度で移動可能距離を計算
              const canMoveE1 = (dx - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e1EffectiveSpeed;
              const canMoveE2 = (dy - (OBJECT_SIZE - 2 * DIFF_OBJECT)) / e2EffectiveSpeed;
              // e1が先に衝突範囲に到達 → e1を優先して移動，e2は衝突範囲に達するまで移動し，その後反転
              if (canMoveE1 < canMoveE2) {
                e1.pos.x = e1.dir === 0 ? e1.originalPos.x + e1EffectiveSpeed * canMoveE2 : e1.originalPos.x - e1EffectiveSpeed * canMoveE2;
                e2.pos.y = e2.dir === 0 ? e1.originalPos.y - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e1.originalPos.y + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e2.dir = e2.dir === 0 ? 1 : 0;
              } 
              // e2が先に衝突範囲に到達 → e2を優先して移動，e1は衝突範囲に達するまで移動し，その後反転
              else if (canMoveE2 < canMoveE1) {
                e2.pos.y = e2.dir === 0 ? e2.originalPos.y + e2EffectiveSpeed * canMoveE1 : e2.originalPos.y - e2EffectiveSpeed * canMoveE1;
                e1.pos.x = e1.dir === 0 ? e2.originalPos.x - (OBJECT_SIZE - 2 * DIFF_OBJECT) : e2.originalPos.x + (OBJECT_SIZE - 2 * DIFF_OBJECT);
                e1.dir = e1.dir === 0 ? 1 : 0;
              } 
              // 同時に衝突範囲に到達 → 両方とも移動可能距離だけ移動し，その後反転
              else {
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
        } 
        // 軸が同じで方向が異なる場合 → 両方とも移動可能距離だけ移動し，その後反転
        else if (e1.dir !== e2.dir) {
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
        } 
        // 軸も方向も同じ場合 → 速度が遅い方を優先して移動，もう一方は衝突範囲に達するまで移動し，その後反転
        else {
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

  // 鍵取得判定
  if (!gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - keyItem.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
        Math.abs(player.pos.y - keyItem.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {
      gameState.isHoldingKeyItem = true;
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
    }
  }

  // ゴール判定
  if (gameState.isHoldingKeyItem) {
    if (Math.abs(player.pos.x - goal.pos.x) < OBJECT_SIZE - 2 * DIFF_OBJECT &&
        Math.abs(player.pos.y - goal.pos.y) < OBJECT_SIZE - 2 * DIFF_OBJECT) {
      gameState.isGoal = true;
      goalSE.currentTime = 0;
      goalSE.play();
    }
  }

  // ゲームオーバー判定
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
  // まず画面端との判定
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
