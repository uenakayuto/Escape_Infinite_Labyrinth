import { showBaseScreen } from "../util/baseScreen.js";
import { SCREEN_BOUNDS, FONT_SIZES, FONT_STYLE, SPACE } from "../util/fontsize.js";
import { COLORS } from "../util/color.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function showRecords(ctx, canvas, records) {
    return new Promise((resolve) => {
        drawRecords(ctx, canvas, records);
        function onKeyDown(e) {
            if (e.key === "Enter") {
                window.removeEventListener("keydown", onKeyDown);
                resolve();
            }
        }
        window.addEventListener("keydown", onKeyDown);
    })
}

export function drawRecords(ctx, canvas, records) {
    showBaseScreen(ctx, canvas);
    ctx.font = `bold ${FONT_SIZES.title}px ${FONT_STYLE.fontStyle}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = FONT_SIZES.lineWidth;
    ctx.strokeStyle = COLORS.border;
    ctx.strokeText("ランキング", drawW / 2, drawH / 7);
    ctx.fillStyle = COLORS.whiteText;
    ctx.fillText("ランキング", drawW / 2, drawH / 7);
    ctx.font = `${FONT_SIZES.menu}px ${FONT_STYLE.fontStyle}`;
    const subtitleY = 3 * drawH / 10;
    const rankX = 2.5 * FONT_SIZES.menu;
    const nameX = rankX + 7.5 * FONT_SIZES.menu;
    const floorX = nameX + 9 * FONT_SIZES.menu;
    const timeX = floorX + 7.5 * FONT_SIZES.menu;
    ctx.strokeText("ランク", rankX, subtitleY);
    ctx.fillText("ランク", rankX, subtitleY);
    ctx.strokeText("プレイヤ", nameX, subtitleY);
    ctx.fillText("プレイヤ", nameX, subtitleY);
    ctx.strokeText("クリアフロア", floorX, subtitleY);
    ctx.fillText("クリアフロア", floorX, subtitleY);
    ctx.strokeText("クリアタイム", timeX, subtitleY);
    ctx.fillText("クリアタイム", timeX, subtitleY);
    for (let i = 0; i < 5; i++) {
        const y = subtitleY + (i + 1) * SPACE.menuSpacing;
        const record = records[i];

        const playerName = record ? record.playerName : "--------";
        const clearFloor = record ? `${record.clearFloor} F` : "----";
        const clearTimeAfterParse = record ? record.clearTimeAfterParse : "--: --. ---";

        if (i === 0) {
            ctx.fillStyle = COLORS.gold;
            ctx.strokeText("1st", rankX, y);
            ctx.fillText("1st", rankX, y);
        } else if (i === 1) {
            ctx.fillStyle = COLORS.silver;
            ctx.strokeText("2nd", rankX, y);
            ctx.fillText("2nd", rankX, y);
        } else if (i === 2) {
            ctx.fillStyle = COLORS.bronze;
            ctx.strokeText("3rd", rankX, y);
            ctx.fillText("3rd", rankX, y);
        } else {
            ctx.fillStyle = COLORS.whiteText;
            ctx.strokeText(`${i + 1}th`, rankX, y);
            ctx.fillText(`${i + 1}th`, rankX, y);
        }

        ctx.strokeText(playerName, nameX, y);
        ctx.fillText(playerName, nameX, y);

        ctx.strokeText(clearFloor, floorX, y);
        ctx.fillText(clearFloor, floorX, y);

        ctx.strokeText(clearTimeAfterParse, timeX, y);
        ctx.fillText(clearTimeAfterParse, timeX, y);
    }
    ctx.strokeText("タイトルに戻る [Enter]", drawW / 2, 9 * drawH / 10);
    ctx.fillText("タイトルに戻る [Enter]", drawW / 2, 9 * drawH / 10);
}