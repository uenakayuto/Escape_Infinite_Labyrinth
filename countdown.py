import pygame
from const import WIDTH, HEIGHT, WHITE

def countdown(screen, font, draw_background, color=WHITE):
    for count in range(3, 0, -1):
        draw_background()  # 背景（マップ・敵・プレイヤーなど）を描画
        text_surface = font.render(str(count), True, color)
        text_rect = text_surface.get_rect(center=(WIDTH // 2, HEIGHT // 2))
        screen.blit(text_surface, text_rect)

        pygame.display.update()
        pygame.time.delay(1000)  # 1秒表示