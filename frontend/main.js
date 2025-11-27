import { COLORS } from "./util/color.js"; 
import { FONT_SIZES, FONT_STYLE, SPACE, SCREEN_BOUNDS, sliderSize } from "./util/fontsize.js";
import { fadeOut } from "./util/fade.js";
import { startGame, fadeInGameSE, gameStartGameSE, getKeyItemSE, gameBgm } from "./game/game.js";
import { goalSE, gameOverSE } from "./game/logic.js";
import { countdownSE } from "./game/countdown.js";
import { generateInitialBoard } from "./game/randomGenerator.js";
import { showHowToPlay } from "./howToPlay/howToPlay.js";
import { showRecords, drawRecords } from "./record/record.js";
import { showCredits } from "./credits/credits.js";
import { showBaseScreen } from "./util/baseScreen.js";
import { state } from "./util/name.js";
import { volumes } from "./util/bgmSettings.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// main.js
const isLocal = location.hostname === "127.0.0.1";
export const API_BASE_URL = isLocal
  ? "http://localhost:3000"   // 開発時
  : "https://example.com";    // デプロイ後

canvas.width = SCREEN_BOUNDS.drawW;
canvas.height = SCREEN_BOUNDS.drawH;

let bgImage = new Image();
bgImage.src = './resource/img/title_screen.png';

export const cousorSE = new Audio('./resource/se/cursor.ogg');

export const selectCreditsSE = new Audio('./resource/se/select_credits.ogg');

const gameStartSE = new Audio('./resource/se/game_start.ogg');

export const menuSelectSE = new Audio('./resource/se/menu_select.ogg');

export const titleBgm = new Audio('./resource/bgm/title.ogg');
titleBgm.loop = true;

const sliders = {
  bgm: { x: SCREEN_BOUNDS.drawW - sliderSize.width - sliderSize.height, y: SCREEN_BOUNDS.drawH - 4 * sliderSize.height, width: sliderSize.width, height: sliderSize.height },
  se:  { x: SCREEN_BOUNDS.drawW - sliderSize.width - sliderSize.height, y: SCREEN_BOUNDS.drawH - 2 * sliderSize.height, width: sliderSize.width, height: sliderSize.height }
};

function drawSlider(ctx, label, slider, value) {
  // ラベル
  ctx.font = `${sliderSize.height}px ${FONT_STYLE.fontStyle}`;
  ctx.fillStyle = COLORS.whiteText;

  ctx.textAlign = "right";
  ctx.fillText(label, slider.x - sliderSize.height, slider.y);

  // バー（背景）
  ctx.fillStyle = COLORS.barBackground;
  ctx.fillRect(slider.x, slider.y, slider.width, slider.height);

  // バー（値）
  ctx.fillStyle = COLORS.barFill;
  ctx.fillRect(slider.x, slider.y, slider.width * value, slider.height);

  // ノブ
  ctx.beginPath();
  ctx.arc(slider.x + slider.width * value, slider.y + slider.height / 2, slider.height / 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.knob;
  ctx.fill();
}

function bgmManager() {
  cousorSE.volume = volumes.seVolume;
  selectCreditsSE.volume = 0.8 * volumes.seVolume;
  gameStartSE.volume = volumes.seVolume;
  menuSelectSE.volume = volumes.seVolume;
  countdownSE.volume = volumes.seVolume;
  fadeInGameSE.volume = volumes.seVolume;
  gameStartGameSE.volume = volumes.seVolume;
  getKeyItemSE.volume = volumes.seVolume;
  goalSE.volume = volumes.seVolume;
  gameOverSE.volume = volumes.seVolume;

  titleBgm.volume = volumes.bgmVolume;
  gameBgm.volume = volumes.bgmVolume;
}

// ▼ 選択中メニューを保持（0=ゲームスタート, 1=遊び方, 2=ランキング）
let selectedTitleMenuIndex = 0;

// ▼ メニュー項目配列（位置計算のため）
const titleMenuItems = [
  { label: "ゲームスタート" },
  { label: "遊び方" },
  { label: "ランキングを見る" }
];

let isNameInputActive = false;

export const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.maxLength = 12;
nameInput.style.opacity = 0;
nameInput.style.pointerEvents = "none"; // クリック無効
nameInput.style.position = "fixed"; // fixed にする
nameInput.style.top = canvas.getBoundingClientRect().top + "px";
nameInput.style.left = canvas.getBoundingClientRect().right + "px";
nameInput.style.width = "1px";
nameInput.style.height = "1px";
nameInput.tabIndex = -1;
document.body.appendChild(nameInput);

// タイトル専用のキー入力ハンドラ
async function handleTitleKeys(e) {
  if (!isNameInputActive) {
  if (e.key === 'ArrowUp') {
      cousorSE.currentTime = 0;
      cousorSE.play();
      selectedTitleMenuIndex = (selectedTitleMenuIndex - 1 + titleMenuItems.length) % titleMenuItems.length;
      drawTitle();
    }
    else if (e.key === 'ArrowDown') {
      cousorSE.currentTime = 0;
      cousorSE.play();
      selectedTitleMenuIndex = (selectedTitleMenuIndex + 1) % titleMenuItems.length;
      drawTitle();
    }
    else if (e.key === 'c') {
      // クレジット画面へ遷移
      cleanupTitle();
      selectCreditsSE.currentTime = 0;
      selectCreditsSE.play();
      await fadeOut(ctx, canvas, 1000, 1000, () => {
        drawTitle();
      }, true, titleBgm);
      await showCredits(ctx, canvas);
      startTitle();
    }
    else if (e.key === 'Enter') {
      // メニューに応じて遷移
      cleanupTitle();
      if (selectedTitleMenuIndex === 0) {
        gameStartSE.currentTime = 0;
        gameStartSE.play();
        const fadeOutPromise = fadeOut(ctx, canvas, 1000, 1000, () => {
          drawTitle();
        }, true, titleBgm);
        const initialBoardPromise = generateInitialBoard();

        await fadeOutPromise;
        const boardData = await initialBoardPromise;
        startGame(ctx, canvas, boardData);
      } else if (selectedTitleMenuIndex === 1) {
        menuSelectSE.currentTime = 0;
        menuSelectSE.play();
        await fadeOut(ctx, canvas, 1000, 1000, () => {
          drawTitle();
        });
        await showHowToPlay(ctx, canvas);
        startTitle();
      } else if (selectedTitleMenuIndex === 2) {
        menuSelectSE.currentTime = 0;
        menuSelectSE.play();
        try {
          const fadeOutPromise = fadeOut(ctx, canvas, 1000, 1000, () => {
            drawTitle();
          });

          const fetchPromise = fetch(`${API_BASE_URL}/api/fetch`).then(res => res.json());

          await fadeOutPromise;
          const records = await fetchPromise;

          await showRecords(ctx, canvas, records);
          await fadeOut(ctx, canvas, 1000, 1000, () => {
            drawRecords(ctx, canvas, records);
          });

        } catch (err) {
          console.error("ランキング取得エラー:", err);
        }
        startTitle();
      }
    }
  }
}

// タイトル画面を開始する関数
export function startTitle() {
  selectedTitleMenuIndex = 0;
  drawTitle();

  document.addEventListener('keydown', handleTitleKeys);

  canvas.addEventListener("click", handleCanvasClick);

  nameInput.addEventListener("input", handleNameInput);

  canvas.addEventListener("mousedown", handleVolumeChange);

  bgImage.onload = () => drawTitle();

  bgmManager();

  if (titleBgm.paused) {
    titleBgm.volume = volumes.bgmVolume;
    titleBgm.currentTime = 0;
    titleBgm.play();
  }
}

const boxPadding = SPACE.paddingNameBox;
export const boxHeight = FONT_SIZES.name + boxPadding * 2;
export const boxWidth = FONT_SIZES.name * 16 + boxPadding * 2;

export const boxX = SCREEN_BOUNDS.drawW - boxWidth - FONT_SIZES.lineWidth;
export const boxY = FONT_SIZES.lineWidth;

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

  drawTitle();
}

function handleNameInput(e) {
  state.playerName = e.target.value;
  drawTitle();
}

function handleVolumeChange(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

  // BGMスライダー操作
  if (mouseY >= sliders.bgm.y && mouseY <= sliders.bgm.y + 20 && mouseX >= sliders.bgm.x && mouseX <= sliders.bgm.x + sliders.bgm.width) {
    volumes.bgmVolume = Math.min(Math.max((mouseX - sliders.bgm.x) / sliders.bgm.width, 0), 1);
  }

  // SEスライダー操作
  if (mouseY >= sliders.se.y && mouseY <= sliders.se.y + 20 && mouseX >= sliders.se.x && mouseX <= sliders.se.x + sliders.se.width) {
    volumes.seVolume = Math.min(Math.max((mouseX - sliders.se.x) / sliders.se.width, 0), 1);
  }

  bgmManager();

  drawTitle();
}

// タイトル画面から離れるときにイベントを解除する
function cleanupTitle() {
  document.removeEventListener('keydown', handleTitleKeys);
  canvas.removeEventListener("click", handleCanvasClick);
  nameInput.removeEventListener("input", handleNameInput);
  canvas.removeEventListener("mousedown", handleVolumeChange);
}

function drawTitle() {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 背景画像
  if (bgImage.complete && bgImage.naturalWidth !== 0) {

    ctx.drawImage(bgImage, 0, 0, SCREEN_BOUNDS.drawW, SCREEN_BOUNDS.drawH);

    drawNameBox();
  }

  // タイトル
  const text = "Escape Infinite Labyrinth";
  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleX = SCREEN_BOUNDS.drawW / 2;
  const titleY = SCREEN_BOUNDS.drawH * 0.25;

  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.strokeText(text, titleX, titleY);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText(text, titleX, titleY);

  // メニュー描画
  const menuFontSize = FONT_SIZES.menu;
  ctx.font = `${menuFontSize}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const menuX = SCREEN_BOUNDS.drawW / 2;
  const menuY = SCREEN_BOUNDS.drawH * 0.75;
  const spacing = SPACE.menuSpacing;

  // 「遊び方」を基準に上下に配置
  const howToPlayY = menuY;
  const gameStartY = howToPlayY - spacing;
  const recordsY = howToPlayY + spacing;

  const menuPositions = [gameStartY, howToPlayY, recordsY];

  titleMenuItems.forEach((item, i) => {
    const y = menuPositions[i];

    // メニュー文字描画
    ctx.strokeText(item.label, menuX, y);
    ctx.fillText(item.label, menuX, y);

    // 選択中ならポインタ表示（左にオフセット）
    if (selectedTitleMenuIndex === i) {
      const pointerText = "▶︎";

      // テキストサイズと余白を考慮して左に配置
      const pointerX = menuX - ctx.measureText(item.label).width / 2 - menuFontSize;
      
      // 縁取り
      ctx.strokeText(pointerText, pointerX, y);

      // 塗り
      ctx.fillText(pointerText, pointerX, y);
    }
  });

  // 下部クレジット
  const creditText = "クレジット [c]";
  ctx.font = `${FONT_SIZES.credits}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const creditX = SCREEN_BOUNDS.drawW / 2;
  const creditY = SCREEN_BOUNDS.drawH - SPACE.paddingCreditsBottomOnTitle;

  ctx.fillText(creditText, creditX, creditY);

  ctx.font = `${sliderSize.height}px ${FONT_STYLE.fontStyle}`;

  ctx.textBaseline = "top";
  ctx.fillText("クリックで調整", sliders.bgm.x + sliders.bgm.width / 2, sliders.bgm.y - 1.5 * sliderSize.height);

  drawSlider(ctx, "BGM", sliders.bgm, volumes.bgmVolume);
  drawSlider(ctx, "SE", sliders.se, volumes.seVolume);
}

function drawNameBox() {
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

function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const gameAspect = canvas.width / canvas.height;
  const windowAspect = windowWidth / windowHeight;

  let renderWidth, renderHeight;

  if (windowAspect > gameAspect) {
    // 画面が横に広い → 高さ基準
    renderHeight = windowHeight;
    renderWidth = renderHeight * gameAspect;
  } else {
    // 画面が縦に長い → 幅基準
    renderWidth = windowWidth;
    renderHeight = renderWidth / gameAspect;
  }

  canvas.style.width = renderWidth + "px";
  canvas.style.height = renderHeight + "px";
  canvas.style.margin = "auto";
  canvas.style.display = "block";
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);

export function showFirstScreen() {
    drawFirstScreen();
    document.addEventListener('keydown', handleFirstScreenKeys);
}

function drawFirstScreen() {
  showBaseScreen(ctx);
  ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = FONT_SIZES.lineWidth;
  ctx.strokeStyle = COLORS.border;
  ctx.strokeText("Escape Infinite Labyrinth", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH / 4);
  ctx.fillStyle = COLORS.whiteText;
  ctx.fillText("Escape Infinite Labyrinth", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH / 4);

  ctx.font = `${FONT_SIZES.creditSubtitle}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("Press Enter to Start", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH * 3 / 4);
  ctx.fillText("Press Enter to Start", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH * 3 / 4);

  ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
  ctx.strokeText("(※音が出るので注意)", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH * 3 / 4 + FONT_SIZES.creditSubtitle);
  ctx.fillText("(※音が出るので注意)", SCREEN_BOUNDS.drawW / 2, SCREEN_BOUNDS.drawH * 3 / 4 + FONT_SIZES.creditSubtitle);
}

function handleFirstScreenKeys(e) {
  if (e.key === "Enter") {
    document.removeEventListener('keydown', handleFirstScreenKeys);
    startTitle();
  }
}
