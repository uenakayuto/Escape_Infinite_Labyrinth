import { drawGameBoard } from "./game.js"; // 既存関数
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function countdown(ctx, canvas, boardData) {
  return new Promise((resolve) => {
    const numbers = [3, 2, 1];
    let index = 0;

    function drawNumber() {
      drawGameBoard(ctx, canvas, boardData); // 背景描画

      // 数字を中央に描画
      const number = numbers[index];
      ctx.font = `bold ${FONT_SIZES.countdown}px ${FONT_STYLE.fontStyle}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = FONT_SIZES.lineWidth;
      ctx.strokeStyle = COLORS.border;
      ctx.strokeText(number, drawW / 2, drawH / 2);
      ctx.fillStyle = COLORS.redText;
      ctx.fillText(number, drawW / 2, drawH / 2);

      index++;
      if (index < numbers.length + 1) {
        setTimeout(drawNumber, 1000); // 1秒ごとに次の数字
      } else {
        resolve(); // カウントダウン終了
      }
    }

    drawNumber();
  });
}