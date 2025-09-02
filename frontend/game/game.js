import { fadeIn, fadeOut } from "../util/fade.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS, SPACE } from "../util/fontsize.js";
import { OBJECT_SIZE } from "./setting.js";
import { generateInitialBoard } from "./randomGenerator.js";
import { showBaseScreen } from "../util/baseScreen.js";
import { countdown } from "./countdown.js";
import { gameLogic } from "./logic.js";
import { showHoldScreen, drawScreenToHold } from "./showHoldScreen.js";
import { showResult } from "../result/result.js";
import { COLORS } from "../util/color.js";
import { showPauseScreen } from "./showPauseScreen.js";
import { startTitle } from "../main.js";
import { drawResult } from "../result/result.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const blockImg = new Image();
blockImg.src = './resource/img/block.png';

const playerLookLeftImg = new Image();
playerLookLeftImg.src = './resource/img/player_look_left.png';

const playerLookRightImg = new Image();
playerLookRightImg.src = './resource/img/player_look_right.png';

const playerLookUpImg = new Image();
playerLookUpImg.src = './resource/img/player_look_up.png';

const playerLookDownImg = new Image();
playerLookDownImg.src = './resource/img/player_look_down.png';

const playerFailureImg = new Image();
playerFailureImg.src = './resource/img/player_failure.png';

const keyImg = new Image();
keyImg.src = './resource/img/key.png';

const goalImg = new Image();
goalImg.src = './resource/img/goal.png';

const enemyLookLeftImg = new Image();
enemyLookLeftImg.src = './resource/img/enemy_look_left.png';

const enemyLookRightImg = new Image();
enemyLookRightImg.src = './resource/img/enemy_look_right.png';

const enemyLookUpImg = new Image();
enemyLookUpImg.src = './resource/img/enemy_look_up.png';

const enemyLookDownImg = new Image();
enemyLookDownImg.src = './resource/img/enemy_look_down.png';

// 全画像を配列にまとめる
const images = [
  blockImg, playerLookLeftImg, playerLookRightImg, playerLookUpImg, playerLookDownImg, playerFailureImg, keyImg, goalImg, enemyLookLeftImg, enemyLookRightImg, enemyLookUpImg, enemyLookDownImg
];

// 画像ロード完了をPromiseで待つ関数
function loadImages(imgArray) {
  return Promise.all(imgArray.map(img => {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve(img);
      } else {
        img.onload = () => resolve(img);
      }
    });
  }));
}

export const gameState = {
  isHoldingKeyItem: false,
  isGoal: false,
  isGameOver: false
};

const pressedKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let lastKey = null;

let startTime = null;
let elapsedTime = 0;
let pauseStartTime = null;
let pauseElapsedTime = 0;
let currentFloor = 1;
let clearFloor = 0;
let clearTime = 0;

let isPaused = false;

// ゲーム開始関数
export async function startGame(ctx, canvas, playerName) {
  // 状態保持変数を初期化
  initGameVariables();
  startTime = null;
  elapsedTime = 0;
  pauseStartTime = null;
  pauseElapsedTime = 0;
  currentFloor = 1;
  isPaused = false;
  clearFloor = 0;
  clearTime = 0;

  await loadImages(images);  // ここで全画像ロードを待つ
  let boardData = generateInitialBoard();
  // フェードイン
  await fadeIn(ctx, canvas, 2500, () => drawGameBoard(ctx, canvas, boardData));

  // カウントダウン
  await countdown(ctx, canvas, boardData);

  document.addEventListener('keydown', handleGameKeyDown);
  document.addEventListener('keyup', handleGameKeyUp);

  startTime = performance.now();

  requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
}

export function drawGameBoard(ctx, canvas, boardData) {
  showBaseScreen(ctx, canvas);

  const cols = Math.floor(drawW / OBJECT_SIZE);
  const rows = Math.floor(drawH / OBJECT_SIZE);

  // 壁ブロック描画
  for (let x = 0; x < cols; x++) {
    ctx.drawImage(blockImg, x * OBJECT_SIZE, 0, OBJECT_SIZE, OBJECT_SIZE); // 上
    ctx.drawImage(blockImg, x * OBJECT_SIZE, (rows - 1) * OBJECT_SIZE, OBJECT_SIZE, OBJECT_SIZE); // 下
  }
  for (let y = 0; y < rows - 2; y++) {
    ctx.drawImage(blockImg, 0, (y + 1) * OBJECT_SIZE, OBJECT_SIZE, OBJECT_SIZE); // 左
    ctx.drawImage(blockImg, (cols - 1) * OBJECT_SIZE, (y + 1) * OBJECT_SIZE, OBJECT_SIZE, OBJECT_SIZE); // 右
  }

  // ブロック描画
  boardData.blocks.forEach(block => {
    ctx.drawImage(blockImg, block.pos.x, block.pos.y, OBJECT_SIZE, OBJECT_SIZE);
  });

  // ゴール描画
  ctx.drawImage(goalImg, boardData.goal.pos.x, boardData.goal.pos.y, OBJECT_SIZE, OBJECT_SIZE);

  // 鍵描画
  if (!gameState.isHoldingKeyItem) {
    ctx.drawImage(keyImg, boardData.key.pos.x, boardData.key.pos.y, OBJECT_SIZE, OBJECT_SIZE);
  }
  else {
    // 鍵を持っている場合、プレイヤーの近くに鍵を描画
    ctx.drawImage(keyImg, boardData.player.pos.x + 5 * OBJECT_SIZE / 6, boardData.player.pos.y - OBJECT_SIZE / 6, OBJECT_SIZE / 3, OBJECT_SIZE / 3);
  }

  // 敵描画
  boardData.enemies.forEach(enemy => {
    if (enemy.axis === 0) {
      if (enemy.dir === 0) {
        ctx.drawImage(enemyLookRightImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      }
      else {
        ctx.drawImage(enemyLookLeftImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      }
    } else {
      if (enemy.dir === 0) {
        ctx.drawImage(enemyLookDownImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      } else {
        ctx.drawImage(enemyLookUpImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      }
    }
  });

  // プレイヤー描画
  if (gameState.isGameOver) {
    ctx.drawImage(playerFailureImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
  } else {
    if (lastKey === 'ArrowUp') {
      ctx.drawImage(playerLookUpImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
    } else if (lastKey === 'ArrowDown') {
      ctx.drawImage(playerLookDownImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
    } else if (lastKey === 'ArrowLeft') {
      ctx.drawImage(playerLookLeftImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
    } else if (lastKey === 'ArrowRight') {
      ctx.drawImage(playerLookRightImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
    } else {
      if (boardData.player.pos.x >= drawW / 2) {
        ctx.drawImage(playerLookLeftImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      } else {
        ctx.drawImage(playerLookRightImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE, OBJECT_SIZE);
      }
    }
  }

  // 経過時間描画
  drawElapsedTimeAndFloor(ctx, elapsedTime, currentFloor);
}

async function gameLoop(ctx, canvas, boardData, playerName) {

  if (isPaused) {
    // 一時停止中の処理
    document.removeEventListener('keydown', handleGameKeyDown);
    document.removeEventListener('keyup', handleGameKeyUp);
    pauseStartTime = performance.now();
    const responseFromPause = await showPauseScreen(ctx, canvas, boardData);
    if (responseFromPause === 'resume') {
      isPaused = false;
      document.addEventListener('keydown', handleGameKeyDown);
      document.addEventListener('keyup', handleGameKeyUp);
      pauseElapsedTime += performance.now() - pauseStartTime;
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    }
    else if (responseFromPause === 'restart') {
      // リスタート
      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawGameBoard(ctx, canvas, boardData);
      });
      startGame(ctx, canvas, playerName);
    }
    else if (responseFromPause === 'quit') {
      // タイトルへ戻る
      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawGameBoard(ctx, canvas, boardData);
      });
      startTitle();
    }
  }

  else {
    // 盤面更新（敵の移動など）
    boardData = gameLogic(boardData, pressedKeys);

    // 描画
    if (!gameState.isGameOver && !gameState.isGoal) {
      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      drawGameBoard(ctx, canvas, boardData);
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    } else if (gameState.isGoal) {
      // ゴールした場合の処理
      document.removeEventListener('keydown', handleGameKeyDown);
      document.removeEventListener('keyup', handleGameKeyUp);

      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      clearTime = elapsedTime;
      clearFloor = currentFloor;
      pauseStartTime = performance.now();
      await showHoldScreen(ctx, canvas, boardData, 1500, "STAGE CLEAR!");

      initGameVariables();

      boardData = generateInitialBoard();
      pauseElapsedTime += performance.now() - pauseStartTime;
      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      currentFloor += 1;
      drawGameBoard(ctx, canvas, boardData);

      document.addEventListener('keydown', handleGameKeyDown);
      document.addEventListener('keyup', handleGameKeyUp);
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    } else if (gameState.isGameOver) {
      // ゲームオーバーの場合の処理
      document.removeEventListener('keydown', handleGameKeyDown);
      document.removeEventListener('keyup', handleGameKeyUp);

      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      await showHoldScreen(ctx, canvas, boardData, 1000, "GAME OVER");

      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawScreenToHold(ctx, canvas, boardData, "GAME OVER");
      });
      
      clearTime = parseTime(clearTime);
      const resultAction = await showResult(ctx, canvas, clearFloor, clearTime);
      if (resultAction === 'restart') {
        await fadeOut(ctx, canvas, 1000, 1000, () => {
          drawResult(ctx, canvas, clearFloor, clearTime);
        });
        startGame(ctx, canvas, playerName);
      } else if (resultAction === 'title') {
        await fadeOut(ctx, canvas, 1000, 1000, () => {
          drawResult(ctx, canvas, clearFloor, clearTime);
        });
        startTitle();
      }
    }
  }
}

// keydown
function handleGameKeyDown(e) {
  switch (e.key) {
    case 'ArrowUp': pressedKeys.up = true; lastKey = 'ArrowUp'; break;
    case 'ArrowDown': pressedKeys.down = true; lastKey = 'ArrowDown'; break;
    case 'ArrowLeft': pressedKeys.left = true; lastKey = 'ArrowLeft'; break;
    case 'ArrowRight': pressedKeys.right = true; lastKey = 'ArrowRight'; break;
    case 'Escape': isPaused = true; break;
  }
}

// keyup
function handleGameKeyUp(e) {
  switch (e.key) {
    case 'ArrowUp': pressedKeys.up = false; break;
    case 'ArrowDown': pressedKeys.down = false; break;
    case 'ArrowLeft': pressedKeys.left = false; break;
    case 'ArrowRight': pressedKeys.right = false; break;
  }
}

function initGameVariables() {
  gameState.isHoldingKeyItem = false;
  gameState.isGoal = false;
  gameState.isGameOver = false;
  pressedKeys.up = false;
  pressedKeys.down = false;
  pressedKeys.left = false;
  pressedKeys.right = false;
  lastKey = null;
}


function drawElapsedTimeAndFloor(ctx, elapsed, currentFloor) {
  const timeText = parseTime(elapsed);

  ctx.font = `${FONT_SIZES.timeAndFloor}px ${FONT_STYLE.timeAndFloor}`;

  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  const timeX = SCREEN_BOUNDS.drawW - 3 * SPACE.paddingTimeAndFloor;
  const timeY = SPACE.paddingTimeAndFloor;
  ctx.strokeText(timeText, timeX, timeY);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText(timeText, timeX, timeY);

  const floorText = `${currentFloor} F`;
  ctx.textAlign = 'left';
  const floorX = 3 * SPACE.paddingTimeAndFloor;
  const floorY = timeY
  ctx.strokeText(floorText, floorX, floorY);
  ctx.fillText(floorText, floorX, floorY);
}

function parseTime(elapsed) {
  const totalMs = Math.floor(elapsed);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  const timeText = `${String(minutes).padStart(2, "0")}: ` +
               `${String(seconds).padStart(2, "0")}. ` +
               `${String(milliseconds).padStart(3, "0")}`;
  return timeText;
}