import { drawGameBoard } from "./game.js";
import { SCREEN_BOUNDS, FONT_SIZES, FONT_STYLE, SPACE } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const pauseMenuItems = [
  { label: "ゲームに戻る", action: "resume" },
  { label: "やり直す", action: "restart" },
  { label: "タイトルに戻る", action: "quit" }
];

let selectedPauseMenuIndex = 0;

export function showPauseScreen(ctx, canvas, boardData) {
  return new Promise((resolve) => {
    selectedPauseMenuIndex = 0;
    // 最初に描画
    drawPauseScreen(ctx, canvas, boardData);

    function onKeyDown(e) {
      if (e.key === "ArrowUp") {
        selectedPauseMenuIndex =
          (selectedPauseMenuIndex - 1 + pauseMenuItems.length) %
          pauseMenuItems.length;
        drawPauseScreen(ctx, canvas, boardData);
      } else if (e.key === "ArrowDown") {
        selectedPauseMenuIndex =
          (selectedPauseMenuIndex + 1) % pauseMenuItems.length;
        drawPauseScreen(ctx, canvas, boardData);
      } else if (e.key === "Enter") {
        const selectedAction = pauseMenuItems[selectedPauseMenuIndex].action;

        // キーイベントを解除
        window.removeEventListener("keydown", onKeyDown);

        // resolveで呼び出し元に返す
        resolve(selectedAction);
      }
    }

    // イベントリスナー登録
    window.addEventListener("keydown", onKeyDown);
  });
}

function drawPauseScreen(ctx, canvas, boardData) {

  // 背景を描画
  drawGameBoard(ctx, canvas, boardData);

  // 画面全体を少し暗くする（透明な黒を重ねる）
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 50%透明の黒
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 中央の黒い矩形を描画
  const rectW = 3 * drawW / 4;
  const rectH = 3 * drawH / 4;
  const rectX = drawW / 8;
  const rectY = drawH / 8;

  ctx.lineWidth = FONT_SIZES.boxLineWidth;
  ctx.strokeStyle = COLORS.whiteBorder;
  ctx.strokeRect(rectX, rectY, rectW, rectH);
  ctx.fillStyle = COLORS.fade;
  ctx.fillRect(rectX, rectY, rectW, rectH);

  // 中央に「PAUSE」テキストを表示
  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.strokeText("Pause", drawW / 2, drawH / 4);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("Pause", drawW / 2, drawH / 4);

  // メニュー項目を描画
  const menuYStart = drawH / 2 + SPACE.menuSpacing;
  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;

  pauseMenuItems.forEach((item, i) => {
    const menuY = menuYStart + i * SPACE.menuSpacing;

    ctx.strokeText(item.label, drawW / 2, menuY);
    ctx.fillText(item.label, drawW / 2, menuY);

    if (selectedPauseMenuIndex === i) {
      const pointerX = drawW / 2 - ctx.measureText(item.label).width / 2 - FONT_SIZES.menu;
      ctx.strokeText("▶︎", pointerX, menuY);
      ctx.fillText("▶︎", pointerX, menuY);
    }
  });
}
