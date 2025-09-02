import { COLORS } from "./color.js";

export function fadeOut(ctx, canvas, duration = 1000, hold = 1000, drawScene = () => {}) {
    return new Promise((resolve) => {
        let startTime = null;

        function animate(now) {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;

            // フェード比率 0～1
            const alpha = Math.min(elapsed / duration, 1);

            // 1) シーンを毎フレーム描画
            drawScene();

            // 2) 黒い四角を透過度alphaで描画
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = COLORS.fade;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                // 完全に黒で塗りつぶし、hold時間キープ
                ctx.globalAlpha = 1;
                ctx.fillStyle = COLORS.fade;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                setTimeout(() => {
                    resolve();
                }, hold);
            }
        }

        requestAnimationFrame(animate);
    });
}

export function fadeIn(ctx, canvas, duration = 2500, drawScene = () => {}) {
    return new Promise((resolve) => {
        let startTime = null;

        function animate(now) {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;

            // フェード比率 0～1
            const alpha = Math.max(0, 1 - elapsed / duration);

            // 1) シーンを毎フレーム描画
            drawScene();

            // 2) 黒い四角を透過度alphaで描画
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = COLORS.fade;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                drawScene();
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}