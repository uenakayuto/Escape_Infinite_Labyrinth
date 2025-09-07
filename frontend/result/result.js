import { showBaseScreen } from "../util/baseScreen.js";
import { SCREEN_BOUNDS, FONT_SIZES, FONT_STYLE, SPACE } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";
import { cousorSE } from "../main.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const resultMenuItems = [
    { label: "もう一度遊ぶ", action: "restart" },
    { label: "タイトルに戻る", action: "title" }
];

let selectedResultMenuIndex = 0;

export function showResult(ctx, canvas, floor, time) {
    return new Promise((resolve) => {
        selectedResultMenuIndex = 0;
        // 最初に描画
        drawResult(ctx, canvas, floor, time);

        function onKeyDown(e) {
            if (e.key === "ArrowUp") {
                cousorSE.currentTime = 0;
                cousorSE.play();
                selectedResultMenuIndex =
                    (selectedResultMenuIndex - 1 + resultMenuItems.length) %
                    resultMenuItems.length;
                drawResult(ctx, canvas, floor, time);
            } else if (e.key === "ArrowDown") {
                cousorSE.currentTime = 0;
                cousorSE.play();
                selectedResultMenuIndex =
                    (selectedResultMenuIndex + 1) % resultMenuItems.length;
                drawResult(ctx, canvas, floor, time);
            } else if (e.key === "Enter") {
                const selectedAction = resultMenuItems[selectedResultMenuIndex].action;

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

export function drawResult(ctx, canvas, floor, time) {
  showBaseScreen(ctx, canvas);

  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.strokeText("Result", drawW / 2, drawH / 7);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("Result", drawW / 2, drawH / 7);

  ctx.font = `${FONT_SIZES.resultSubtitle}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("クリアフロア", drawW / 4, drawH / 3);
  ctx.fillText("クリアフロア", drawW / 4, drawH / 3);

  ctx.strokeText("クリアタイム", 3 * drawW / 4, drawH / 3);
  ctx.fillText("クリアタイム", 3 * drawW / 4, drawH / 3);

  ctx.strokeText(`${floor} F`, drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);
  ctx.fillText(`${floor} F`, drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);

  ctx.strokeText(time, 3 * drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);
  ctx.fillText(time, 3 * drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);

  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;

  resultMenuItems.forEach((item, i) => {
    const y = 5 * drawH / 8 + SPACE.menuSpacing * (i + 1);
    ctx.strokeText(item.label, drawW / 2, y);
    ctx.fillText(item.label, drawW / 2, y);

    if (selectedResultMenuIndex === i) {
      const pointerX = drawW / 2 - ctx.measureText(item.label).width / 2 - FONT_SIZES.menu;
      ctx.strokeText("▶︎", pointerX, y);
      ctx.fillText("▶︎", pointerX, y);
    }
  });
}
