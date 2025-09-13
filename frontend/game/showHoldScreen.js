import { drawGameBoard } from "./game.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function showHoldScreen(ctx, boardData, hold, message) {
  return new Promise((resolve) => {
    drawScreenToHold(ctx, boardData, message);

    setTimeout(() => {
      resolve();
    }, hold);
  });
}

export function drawScreenToHold(ctx, boardData, message) {

  drawGameBoard(ctx, boardData);

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
