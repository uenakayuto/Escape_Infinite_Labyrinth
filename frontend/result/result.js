import { showBaseScreen } from "../util/baseScreen.js";
import { SCREEN_BOUNDS, FONT_SIZES, FONT_STYLE, SPACE } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";
import { cousorSE, selectCreditsSE, boxX, boxY, boxWidth, boxHeight, nameInput } from "../main.js";
import { state } from "../util/name.js";

const { drawW, drawH } = SCREEN_BOUNDS;

const resultMenuItems = [
    { label: "もう一度遊ぶ", action: "restart" },
    { label: "タイトルに戻る", action: "title" }
];

let selectedResultMenuIndex = 0;
let isNameInputActive = false;

export function showResult(ctx, canvas, floor, time, timeAfterParse, date, isAddEventListeners) {
    return new Promise((resolve) => {
        selectedResultMenuIndex = 0;

        function onKeyDown(e) {
            if (!isNameInputActive) {
                if (e.key === "ArrowUp") {
                    cousorSE.currentTime = 0;
                    cousorSE.play();
                    selectedResultMenuIndex =
                        (selectedResultMenuIndex - 1 + resultMenuItems.length) %
                        resultMenuItems.length;
                    drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners);
                } else if (e.key === "ArrowDown") {
                    cousorSE.currentTime = 0;
                    cousorSE.play();
                    selectedResultMenuIndex =
                        (selectedResultMenuIndex + 1) % resultMenuItems.length;
                    drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners);
                } else if (e.key === "Enter") {
                    const selectedAction = resultMenuItems[selectedResultMenuIndex].action;

                    // キーイベントを解除
                    window.removeEventListener("keydown", onKeyDown);
                    if (isAddEventListeners) {
                        canvas.removeEventListener("click", handleCanvasClick);
                        nameInput.removeEventListener("input", handleNameInput);
                        if (state.playerName !== "") {
                            fetch("/api/registerRecord", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                playerName: state.playerName,
                                clearFloor: floor,
                                clearTime: time,
                                clearTimeAfterParse: timeAfterParse,
                                date
                            })
                            })
                            .then(res => res.json())
                            .then(data => console.log("登録成功:", data))
                            .catch(err => console.error("登録エラー:", err));
                        }
                    }

                    // resolveで呼び出し元に返す
                    resolve(selectedAction);
                }
            }
        }

        function handleCanvasClick(e) {
            const rect = canvas.getBoundingClientRect();

            // CSS上のサイズに対する比率を計算
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // 内部座標に変換
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            if (
                mouseX >= boxX &&
                mouseX <= boxX + boxWidth &&
                mouseY >= boxY &&
                mouseY <= boxY + boxHeight
            ) {
                selectCreditsSE.currentTime = 0;
                selectCreditsSE.play();
                isNameInputActive = true;
                nameInput.focus(); // IME入力開始
            } else {
                isNameInputActive = false;
                nameInput.blur(); // 入力終了
            }

            drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners);
        }

        function handleNameInput(e) {
            state.playerName = e.target.value;
            drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners);
        }

        window.addEventListener("keydown", onKeyDown);

        // イベントリスナー登録
        if (isAddEventListeners) {
            canvas.addEventListener("click", handleCanvasClick);
            nameInput.addEventListener("input", handleNameInput);
        }
        drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners);
    });
}

export function drawResult(ctx, canvas, floor, timeAfterParse, isAddEventListeners) {
  showBaseScreen(ctx);

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

  ctx.strokeText(timeAfterParse, 3 * drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);
  ctx.fillText(timeAfterParse, 3 * drawW / 4, drawH / 3 + 1.5 * SPACE.menuSpacing);

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

  if (isAddEventListeners) {
    drawNameBox(ctx);
  }
}

function drawNameBox(ctx) {
  // 背景
  ctx.fillStyle = COLORS.nameBg;
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // 枠
  ctx.strokeStyle = isNameInputActive ? "yellow" : COLORS.border;
  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  // テキスト
  ctx.font = `${FONT_SIZES.name}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = state.playerName || "ニックネームを入力(12文字以内)";
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
}
