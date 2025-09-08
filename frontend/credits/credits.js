import { COLORS } from "../util/color.js";
import { FONT_SIZES, FONT_STYLE, SCREEN_BOUNDS } from "../util/fontsize.js";
import { showBaseScreen } from "../util/baseScreen.js";
import { fadeOut } from "../util/fade.js";
import { selectCreditsSE } from "../main.js";

let scrollY = 0;
let maxScrollY = 0;
let animationId;
const keyScrollAmount = 10;

const creditsData = [
    { type: "subtitle", text: "ゲームデザイン" },
    { type: "name", text: "植中雄斗" },
    { type: "subtitle", text: "プログラミング" },
    { type: "name", text: "植中雄斗" },
    { type: "subtitle", text: "グラフィック" },
    { type: "name", text: "植中雄斗" },
    { type: "subtitle", text: "サウンド" },
    { type: "name", text: "植中雄斗" },
    { type: "subtitle", text: "グラフィック制作ツール" },
    { type: "name", text: "Microsoft PowerPoint" },
    { type: "subtitle", text: "BGM制作ツール" },
    { type: "name", text: "Vidnoz AI" },
    { type: "subtitle", text: "SE制作ツール" },
    { type: "name", text: "Bfxr" },
    { type: "subtitle", text: "Special Thanks" },
    { type: "name", text: "ChatGPT" },
    { type: "name", text: "You" },
];

let canvasRef, ctxRef;

export function showCredits(ctx, canvas) {
  return new Promise((resolve) => {
    ctxRef = ctx;
    canvasRef = canvas;
    scrollY = 0;

    function handleKeyDown(e) {
      if (e.key === "Enter") {
        cleanup();
        selectCreditsSE.currentTime = 0;
        selectCreditsSE.play();
        fadeOut(ctxRef, canvasRef, 1000, 1000, () => {
          renderCreditsFrame(); // フェード中に呼ばれる
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

    animationId = requestAnimationFrame(renderCredits);
  });
}

function renderCreditsFrame() {
  const ctx = ctxRef;
  const canvas = canvasRef;

  showBaseScreen(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // タイトル
  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = FONT_SIZES.lineWidth;
  const titleY = SCREEN_BOUNDS.drawH * 0.1 - scrollY;
  ctx.strokeText("クレジット", canvas.width / 2, titleY);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("クレジット", canvas.width / 2, titleY);

  // コンテンツ描画
  let y = titleY + FONT_SIZES.title * 2;

  creditsData.forEach((item, index) => {
    if (item.type === "subtitle") {
      ctx.textAlign = "left";
      ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;
      ctx.strokeText(item.text, FONT_SIZES.creditSubtitle, y);
      ctx.fillText(item.text, FONT_SIZES.creditSubtitle, y);
      y += FONT_SIZES.creditSubtitle * 1.25;
    } else {
      ctx.textAlign = "left";
      ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
      ctx.strokeText(item.text, FONT_SIZES.creditSubtitle * 2, y);
      ctx.fillText(item.text, FONT_SIZES.creditSubtitle * 2, y);
      if (creditsData[index + 1]?.type === "subtitle") {
        y += FONT_SIZES.creditSubtitle * 1.75;
      } else {
        y += FONT_SIZES.menu * 1;
      }
    }
  });

  // 戻るメッセージ
  y += FONT_SIZES.title * 2;
  ctx.textAlign = "center";
  ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("タイトルに戻る [Enter]", canvas.width / 2, y);
  ctx.fillText("タイトルに戻る [Enter]", canvas.width / 2, y);
  y += FONT_SIZES.creditSubtitle + SCREEN_BOUNDS.drawH * 0.1 + scrollY;

  // 最大スクロール量を計算
  maxScrollY = Math.max(0, y - (SCREEN_BOUNDS.drawH));
}

function renderCredits() {
  renderCreditsFrame();
  animationId = requestAnimationFrame(renderCredits);
}
