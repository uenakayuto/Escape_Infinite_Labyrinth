import { COLORS } from "../util/color.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS, SPACE } from "../util/fontsize.js";
import { showBaseScreen } from "../util/baseScreen.js";
import { fadeOut } from "../util/fade.js";
import { menuSelectSE } from "../main.js";
import { loadImages } from "../game/game.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const drawAspectRatio = drawH / drawW;

const boardImg = new Image();
boardImg.src = './resource/img/howToPlay/board.png';

const playerLookLeftImg = new Image();
playerLookLeftImg.src = './resource/img/howToPlay/player_look_left.png';

const playerLookRightImg = new Image();
playerLookRightImg.src = './resource/img/howToPlay/player_look_right.png';

const playerLookUpImg = new Image();
playerLookUpImg.src = './resource/img/howToPlay/player_look_up.png';

const playerLookDownImg = new Image();
playerLookDownImg.src = './resource/img/howToPlay/player_look_down.png';

const beforeGetKeyImg = new Image();
beforeGetKeyImg.src = './resource/img/howToPlay/before_get_key.png';

const afterGetKeyImg = new Image();
afterGetKeyImg.src = './resource/img/howToPlay/after_get_key.png';

const goalImg = new Image();
goalImg.src = './resource/img/howToPlay/goal.png';

const gameOverImg = new Image();
gameOverImg.src = './resource/img/howToPlay/game_over.png';

const purposeImg = new Image();
purposeImg.src = './resource/img/howToPlay/purpose.png';

const images = [
    boardImg, playerLookLeftImg, playerLookRightImg, playerLookUpImg, playerLookDownImg, beforeGetKeyImg, afterGetKeyImg, goalImg, gameOverImg, purposeImg
];

let scrollY = 0;
let maxScrollY = 0;
let animationId;
const keyScrollAmount = 10;

let canvasRef, ctxRef;

export async function showHowToPlay(ctx, canvas) {
  await loadImages(images);
  return new Promise((resolve) => {
    ctxRef = ctx;
    canvasRef = canvas;
    scrollY = 0;

    function handleKeyDown(e) {
      if (e.key === "Enter") {
        cleanup();
        menuSelectSE.currentTime = 0;
        menuSelectSE.play();
        fadeOut(ctxRef, canvasRef, 1000, 1000, () => {
          renderHowToPlayFrame(); // フェード中に呼ばれる
        }).then(() => {
          resolve(); // クレジット画面終了 → 呼び出し元へ制御を返す
        });
      } else if (e.key === "ArrowUp") {
        scrollY = Math.max(0, scrollY - keyScrollAmount);
      } else if (e.key === "ArrowDown") {
        scrollY = Math.min(maxScrollY, scrollY + keyScrollAmount);
      }
    }

    function handleWheel(e) {
      scrollY += e.deltaY;
      scrollY = Math.max(0, Math.min(maxScrollY, scrollY));
    }

    function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    // イベント登録
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: true });

    animationId = requestAnimationFrame(renderHowToPlay);
  });
}

function renderHowToPlayFrame() {
  const ctx = ctxRef;
  const canvas = canvasRef;

  showBaseScreen(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // タイトル
  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = FONT_SIZES.lineWidth;
  const titleY = drawH * 0.1 - scrollY;
  ctx.strokeText("遊び方", canvas.width / 2, titleY);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("遊び方", canvas.width / 2, titleY);

  // コンテンツ描画
  const x = FONT_SIZES.creditSubtitle;
  let y = titleY + FONT_SIZES.title * 2;
  const buttonSize = FONT_SIZES.menu;
  const buttonSpace = buttonSize / 5;
  ctx.textAlign = "left";
  ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;

  // 操作方法
  ctx.strokeText("操作方法", x, y);
  ctx.fillText("操作方法", x, y);
  y += FONT_SIZES.creditSubtitle * 1.25;

  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
  drawButton(ctx, x + buttonSize + buttonSpace, y, buttonSize, buttonSize, "▲");
  y += (buttonSize + buttonSpace / 2) / 2;
  drawButton(ctx, x, y, buttonSize, buttonSize, "◀︎");
  drawButton(ctx, x + 2 * (buttonSize + buttonSpace), y, buttonSize, buttonSize, "▶︎");
  ctx.strokeText(": キャラクター移動", x + 3 * (buttonSize + buttonSpace), y);
  ctx.fillText(": キャラクター移動", x + 3 * (buttonSize + buttonSpace), y);
  y += (buttonSize + buttonSpace) / 2;
  drawButton(ctx, x + buttonSize + buttonSpace, y, buttonSize, buttonSize, "▼");
  y += FONT_SIZES.menu * 1.25;
  drawButton(ctx, x, y, 3 * buttonSize, buttonSize, "Esc");
  ctx.strokeText(": Pause", x + 3 * buttonSize + buttonSpace, y);
  ctx.fillText(": Pause", x + 3 * buttonSize + buttonSpace, y);
  y += FONT_SIZES.creditSubtitle * 2;

  // ルール説明
  ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("ルール", x, y);
  ctx.fillText("ルール", x, y);
  y += FONT_SIZES.creditSubtitle * 1.25;

  const imageBgSize = drawW - 2 * x;
  const imageSize = imageBgSize - 2 * x;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, imageBgSize * drawAspectRatio);
  ctx.drawImage(boardImg, 2 * x, y + x, imageSize, imageBgSize * drawAspectRatio - 2 * x);
  y += imageBgSize * drawAspectRatio + FONT_SIZES.menu * 0.25;
  ctx.textAlign = "center";
  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("これがゲームの盤面！", drawW / 2, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("これがゲームの盤面！", drawW / 2, y);
  y += FONT_SIZES.menu * 4;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, 2 * x + 2 * (imageBgSize * drawAspectRatio - 2 * x) / 3 + SPACE.imageSpacing);
  ctx.drawImage(playerLookUpImg, drawW / 2 - imageSize / 6, y + x, imageSize / 3, (imageBgSize * drawAspectRatio - 2 * x) / 3);
  ctx.drawImage(playerLookLeftImg, drawW / 2 - imageSize / 6 - imageSize / 3 - SPACE.imageSpacing, y + x + ((imageBgSize * drawAspectRatio - 2 * x) / 3 + SPACE.imageSpacing / 2) / 2, imageSize / 3, (imageBgSize * drawAspectRatio - 2 * x) / 3);
  ctx.drawImage(playerLookRightImg, drawW / 2 - imageSize / 6 + imageSize / 3 + SPACE.imageSpacing, y + x + ((imageBgSize * drawAspectRatio - 2 * x) / 3 + SPACE.imageSpacing / 2) / 2, imageSize / 3, (imageBgSize * drawAspectRatio - 2 * x) / 3);
  ctx.drawImage(playerLookDownImg, drawW / 2 - imageSize / 6, y + x + (imageBgSize * drawAspectRatio - 2 * x) / 3 + SPACE.imageSpacing, imageSize / 3, (imageBgSize * drawAspectRatio - 2 * x) / 3);
  y += 2 * x + 2 * (imageBgSize * drawAspectRatio - 2 * x) / 3 + SPACE.imageSpacing + FONT_SIZES.menu * 0.25 + (buttonSize + buttonSpace / 2) / 2;
  ctx.textAlign = "right";
  ctx.strokeText("キャラクターを", drawW / 2 - 3 * buttonSize / 2 - buttonSpace, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("キャラクターを", drawW / 2 - 3 * buttonSize / 2 - buttonSpace, y);
  drawButton(ctx, drawW / 2 - buttonSize / 2, y - (buttonSize + buttonSpace / 2) / 2, buttonSize, buttonSize, "▲");
  drawButton(ctx, drawW / 2 - 3 * buttonSize / 2 - buttonSpace, y, buttonSize, buttonSize, "◀︎");
  drawButton(ctx, drawW / 2 + buttonSize / 2 + buttonSpace, y, buttonSize, buttonSize, "▶︎");
  drawButton(ctx, drawW / 2 - buttonSize / 2, y + (buttonSize + buttonSpace / 2) / 2, buttonSize, buttonSize, "▼");
  ctx.textAlign = "left";
  ctx.strokeText("で動かそう！", drawW / 2 + 3 * buttonSize / 2 + buttonSpace, y);
  ctx.fillText("で動かそう！", drawW / 2 + 3 * buttonSize / 2 + buttonSpace, y);
  y += FONT_SIZES.menu * 4;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, 2 * x + imageBgSize * drawAspectRatio / 2);
  ctx.drawImage(beforeGetKeyImg, 2 * x, y + x, imageSize / 2, imageSize * drawAspectRatio / 2);
  ctx.drawImage(afterGetKeyImg, 2 * x + imageSize / 2 + SPACE.imageSpacing, y + x, imageSize / 2, imageSize * drawAspectRatio / 2);
  y += 2 * x + imageBgSize * drawAspectRatio / 2 + FONT_SIZES.menu * 0.5;
  ctx.textAlign = "center";
  ctx.strokeText("まずは鍵をゲットしよう！", drawW / 2, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("まずは鍵をゲットしよう！", drawW / 2, y);
  y += FONT_SIZES.menu * 3;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, imageBgSize * drawAspectRatio);
  ctx.drawImage(goalImg, 2 * x, y + x, imageSize, imageBgSize * drawAspectRatio - 2 * x);
  y += imageBgSize * drawAspectRatio + FONT_SIZES.menu * 0.5;
  ctx.strokeText("鍵を持ってゴールに向かえ！", drawW / 2, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("鍵を持ってゴールに向かえ！", drawW / 2, y);
  y += FONT_SIZES.menu * 4;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, imageBgSize * drawAspectRatio);
  ctx.drawImage(gameOverImg, 2 * x, y + x, imageSize, imageBgSize * drawAspectRatio - 2 * x);
  y += imageBgSize * drawAspectRatio + FONT_SIZES.menu * 0.5;
  ctx.strokeText("敵に当たるとゲームオーバー！", drawW / 2, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("敵に当たるとゲームオーバー！", drawW / 2, y);
  y += FONT_SIZES.menu * 4;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x, y, imageBgSize, imageBgSize * drawAspectRatio);
  ctx.drawImage(purposeImg, 2 * x, y + x, imageSize, imageBgSize * drawAspectRatio - 2 * x);
  y += imageBgSize * drawAspectRatio + FONT_SIZES.menu * 0.5;
  ctx.strokeText("短い時間で多くのフロアをクリアしよう！", drawW / 2, y);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("短い時間で多くのフロアをクリアしよう！", drawW / 2, y);

  // 戻るメッセージ
  y += FONT_SIZES.title * 3;
  ctx.textAlign = "center";
  ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("タイトルに戻る [Enter]", canvas.width / 2, y);
  ctx.fillText("タイトルに戻る [Enter]", canvas.width / 2, y);
  y += FONT_SIZES.creditSubtitle + drawH * 0.1 + scrollY;

  // 最大スクロール量を計算
  maxScrollY = Math.max(0, y - (drawH));
}

function renderHowToPlay() {
  renderHowToPlayFrame();
  animationId = requestAnimationFrame(renderHowToPlay);
}

function drawButton(ctx, x, y, width, height, label) {
  // 背景の矩形（丸みあり）
  ctx.fillStyle = COLORS.foreground;       // 背景色
  ctx.strokeStyle = COLORS.whiteBorder;     // 枠線色
  roundRect(ctx, x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();

  // テキスト
  ctx.fillStyle = COLORS.whiteText;       // 文字色
  ctx.font = `${3 * FONT_SIZES.menu / 4}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.strokeStyle = COLORS.border; 
  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

// 丸角矩形を描くユーティリティ
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
