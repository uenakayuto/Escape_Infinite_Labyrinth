import { drawGameBoard } from "./game.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function showHoldScreen(ctx, canvas, boardData, hold, message) {
  return new Promise((resolve) => {
    drawScreenToHold(ctx, canvas, boardData, message);

    // 1.5秒後に終了
    setTimeout(() => {
      resolve();
    }, hold);
  });
}

export function drawScreenToHold(ctx, canvas, boardData, message) {
  // 背景（盤面など）を描画
  drawGameBoard(ctx, canvas, boardData);

  // テキスト描画
  const text = message;
  ctx.font = `bold ${FONT_SIZES.stageClear}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.strokeText(text, drawW / 2, drawH / 2);
  ctx.fillStyle = COLORS.redText;
  ctx.fillText(text, drawW / 2, drawH / 2);
}