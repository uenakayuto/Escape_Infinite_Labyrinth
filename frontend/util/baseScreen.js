import { COLORS } from "./color.js"; 
import { SCREEN_BOUNDS } from "./fontsize.js";

const { drawW, drawH } = SCREEN_BOUNDS;

export function showBaseScreen(ctx) {
    ctx.fillStyle = COLORS.foreground;
    ctx.fillRect(
        0,
        0,
        drawW,
        drawH
    );
}
