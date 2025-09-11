import { fadeIn, fadeOut } from "../util/fade.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS, SPACE } from "../util/fontsize.js";
import { OBJECT_SIZE, DIFF_OBJECT } from "./setting.js";
import { generateInitialBoard } from "./randomGenerator.js";
import { showBaseScreen } from "../util/baseScreen.js";
import { countdown } from "./countdown.js";
import { gameLogic } from "./logic.js";
import { showHoldScreen, drawScreenToHold } from "./showHoldScreen.js";
import { showResult } from "../result/result.js";
import { COLORS } from "../util/color.js";
import { showPauseScreen, drawPauseScreen } from "./showPauseScreen.js";
import { startTitle, menuSelectSE } from "../main.js";
import { drawResult } from "../result/result.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const blockImg = new Image();
blockImg.src = './resource/img/object/block.png';

const playerLookLeftImg = new Image();
playerLookLeftImg.src = './resource/img/object/player_look_left.png';

const playerLookRightImg = new Image();
playerLookRightImg.src = './resource/img/object/player_look_right.png';

const playerLookUpImg = new Image();
playerLookUpImg.src = './resource/img/object/player_look_up.png';

const playerLookDownImg = new Image();
playerLookDownImg.src = './resource/img/object/player_look_down.png';

const playerFailureImg = new Image();
playerFailureImg.src = './resource/img/object/player_failure.png';

const keyImg = new Image();
keyImg.src = './resource/img/object/key.png';

const goalImg = new Image();
goalImg.src = './resource/img/object/goal.png';

const enemyLookLeftImg = new Image();
enemyLookLeftImg.src = './resource/img/object/enemy_look_left.png';

const enemyLookRightImg = new Image();
enemyLookRightImg.src = './resource/img/object/enemy_look_right.png';

const enemyLookUpImg = new Image();
enemyLookUpImg.src = './resource/img/object/enemy_look_up.png';

const enemyLookDownImg = new Image();
enemyLookDownImg.src = './resource/img/object/enemy_look_down.png';

const fadeInGameSE = new Audio('./resource/se/fade_in_game.ogg');

const gameStartGameSE = new Audio('./resource/se/game_start_game.ogg');

const getKeyItemSE = new Audio('./resource/se/get_key.ogg');

const gameBgm = new Audio('./resource/bgm/game.ogg');
gameBgm.loop = true;

// 全画像を配列にまとめる
const images = [
  blockImg, playerLookLeftImg, playerLookRightImg, playerLookUpImg, playerLookDownImg, playerFailureImg, keyImg, goalImg, enemyLookLeftImg, enemyLookRightImg, enemyLookUpImg, enemyLookDownImg
];

// 画像ロード完了をPromiseで待つ関数
export function loadImages(imgArray) {
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
export async function startGame(ctx, canvas, playerName, boardData) {
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
  // フェードイン
  fadeInGameSE.currentTime = 0;
  fadeInGameSE.play();
  await fadeIn(ctx, canvas, 2500, () => drawGameBoard(ctx, boardData));

  // カウントダウン
  await countdown(ctx, canvas, boardData);

  document.addEventListener('keydown', handleGameKeyDown);
  document.addEventListener('keyup', handleGameKeyUp);

  gameStartGameSE.currentTime = 0;
  gameStartGameSE.play();

  startTime = performance.now();
  gameBgm.currentTime = 0;
  gameBgm.play();

  requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
}

export function drawGameBoard(ctx, boardData) {
  showBaseScreen(ctx);

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
  ctx.drawImage(goalImg, boardData.goal.pos.x, boardData.goal.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);

  // 鍵描画
  if (!gameState.isHoldingKeyItem) {
    ctx.drawImage(keyImg, boardData.key.pos.x, boardData.key.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
  }
  else {
    // 鍵を持っている場合、プレイヤーの近くに鍵を描画
    ctx.drawImage(keyImg, boardData.player.pos.x + (OBJECT_SIZE - 4 * DIFF_OBJECT), boardData.player.pos.y - OBJECT_SIZE / 6 - DIFF_OBJECT / 3, OBJECT_SIZE / 3, OBJECT_SIZE / 3);
  }

  // 敵描画
  boardData.enemies.forEach(enemy => {
    if (enemy.axis === 0) {
      if (enemy.dir === 0) {
        ctx.drawImage(enemyLookRightImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      }
      else {
        ctx.drawImage(enemyLookLeftImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      }
    } else {
      if (enemy.dir === 0) {
        ctx.drawImage(enemyLookDownImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      } else {
        ctx.drawImage(enemyLookUpImg, enemy.pos.x, enemy.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      }
    }
  });

  // プレイヤー描画
  if (gameState.isGameOver) {
    ctx.drawImage(playerFailureImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
  } else {
    if (lastKey === 'ArrowUp') {
      ctx.drawImage(playerLookUpImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
    } else if (lastKey === 'ArrowDown') {
      ctx.drawImage(playerLookDownImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
    } else if (lastKey === 'ArrowLeft') {
      ctx.drawImage(playerLookLeftImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
    } else if (lastKey === 'ArrowRight') {
      ctx.drawImage(playerLookRightImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
    } else {
      if (boardData.player.pos.x >= drawW / 2) {
        ctx.drawImage(playerLookLeftImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      } else {
        ctx.drawImage(playerLookRightImg, boardData.player.pos.x, boardData.player.pos.y, OBJECT_SIZE - 2 * DIFF_OBJECT, OBJECT_SIZE - 2 * DIFF_OBJECT);
      }
    }
  }

  // 経過時間描画
  drawElapsedTimeAndFloor(ctx, elapsedTime, currentFloor);
}

async function gameLoop(ctx, canvas, boardData, playerName) {

  if (isPaused) {
    // 一時停止中の処理
    gameBgm.pause();
    getKeyItemSE.currentTime = 0;
    getKeyItemSE.play();
    document.removeEventListener('keydown', handleGameKeyDown);
    document.removeEventListener('keyup', handleGameKeyUp);
    pauseStartTime = performance.now();
    const responseFromPause = await showPauseScreen(ctx, canvas, boardData);
    if (responseFromPause === 'resume') {
      isPaused = false;
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
      gameBgm.play();
      document.addEventListener('keydown', handleGameKeyDown);
      document.addEventListener('keyup', handleGameKeyUp);
      pauseElapsedTime += performance.now() - pauseStartTime;
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    }
    else if (responseFromPause === 'restart') {
      // リスタート
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
      const fadeOutPromise = fadeOut(ctx, canvas, 1000, 1000, () => {
        drawPauseScreen(ctx, canvas, boardData);
      });
      const initialBoardPromise = generateInitialBoard();

      await fadeOutPromise;
      boardData = await initialBoardPromise;
      startGame(ctx, canvas, playerName, boardData);
    }
    else if (responseFromPause === 'quit') {
      // タイトルへ戻る
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawPauseScreen(ctx, canvas, boardData);
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
      drawGameBoard(ctx, boardData);
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    } else if (gameState.isGoal) {
      // ゴールした場合の処理
      document.removeEventListener('keydown', handleGameKeyDown);
      document.removeEventListener('keyup', handleGameKeyUp);

      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      clearTime = elapsedTime;
      clearFloor = currentFloor;
      pauseStartTime = performance.now();
      const holdPromise = showHoldScreen(ctx, canvas, boardData, 1500, "STAGE CLEAR!");
      boardData = generateInitialBoard();
      await holdPromise;

      initGameVariables();

      pauseElapsedTime += performance.now() - pauseStartTime;
      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      currentFloor += 1;
      drawGameBoard(ctx, boardData);

      document.addEventListener('keydown', handleGameKeyDown);
      document.addEventListener('keyup', handleGameKeyUp);
      requestAnimationFrame(() => gameLoop(ctx, canvas, boardData, playerName));
    } else if (gameState.isGameOver) {
      // ゲームオーバーの場合の処理
      gameBgm.pause();
      document.removeEventListener('keydown', handleGameKeyDown);
      document.removeEventListener('keyup', handleGameKeyUp);

      elapsedTime = performance.now() - startTime - pauseElapsedTime;
      clearTime = Math.floor(clearTime);
      const clearTimeAfterParse = parseTime(clearTime);
      const date = new Date().toISOString();

      if (playerName !== "") {
        fetch("/api/registerRecord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            playerName,
            clearFloor,
            clearTime,
            clearTimeAfterParse,
            date
          })
        })
          .then(res => res.json())
          .then(data => console.log("登録成功:", data))
          .catch(err => console.error("登録エラー:", err));
      }

      await showHoldScreen(ctx, canvas, boardData, 1000, "GAME OVER");

      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawScreenToHold(ctx, canvas, boardData, "GAME OVER");
      });
      
      getKeyItemSE.currentTime = 0;
      getKeyItemSE.play();
      // リザルト画面へ
      const resultAction = await showResult(ctx, canvas, clearFloor, clearTimeAfterParse);
      if (resultAction === 'restart') {
        menuSelectSE.currentTime = 0;
        menuSelectSE.play();
        const fadeOutPromise = fadeOut(ctx, canvas, 1000, 1000, () => {
          drawResult(ctx, canvas, clearFloor, clearTimeAfterParse);
        });
        const initialBoardPromise = generateInitialBoard();

        await fadeOutPromise;
        boardData = await initialBoardPromise;
        startGame(ctx, canvas, playerName, boardData);
      } else if (resultAction === 'title') {
        menuSelectSE.currentTime = 0;
        menuSelectSE.play();
        await fadeOut(ctx, canvas, 1000, 1000, () => {
          drawResult(ctx, canvas, clearFloor, clearTimeAfterParse);
        });
        startTitle();
      }
    }
  }
}

// keydown
function handleGameKeyDown(e) {
  switch (e.key) {
    case 'Escape': {
      isPaused = true;
      pressedKeys.right = false;
      pressedKeys.left = false;
      pressedKeys.down = false;
      pressedKeys.up = false;
      break;
    }
    case 'ArrowRight': {
      pressedKeys.right = true;
      lastKey = 'ArrowRight';
      pressedKeys.left = false;
      pressedKeys.down = false;
      pressedKeys.up = false;
      break;
    }
    case 'ArrowLeft': {
      pressedKeys.left = true;
      lastKey = 'ArrowLeft';
      pressedKeys.right = false;
      pressedKeys.down = false;
      pressedKeys.up = false;
      break;
    }
    case 'ArrowDown': {
      pressedKeys.down = true;
      lastKey = 'ArrowDown';
      pressedKeys.right = false;
      pressedKeys.left = false;
      pressedKeys.up = false;
      break;
    }
    case 'ArrowUp': {
      pressedKeys.up = true;
      lastKey = 'ArrowUp';
      pressedKeys.right = false;
      pressedKeys.left = false;
      pressedKeys.down = false;
      break;
    }
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
