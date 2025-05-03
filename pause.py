import pygame
import sys
from const import WIDTH, HEIGHT, WHITE, BLACK, FONT_SIZE_MENU, FONT_SIZE_GAME_TITLE
from fade import fade_out

def show_pause_menu(screen):
    pygame.font.init()
    clock = pygame.time.Clock()

    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)
    menu_font = pygame.font.SysFont(None, FONT_SIZE_MENU)

    menu_options = ["Resume the game", "Quit to title"]
    selected = 0

    while True:
        # 背景を黒で塗りつぶす
        screen.fill(BLACK)

        # タイトル表示（中央上部）
        title_surf = title_font.render("Pause", True, WHITE)
        title_rect = title_surf.get_rect(center=(WIDTH // 2, 3*HEIGHT // 8))
        screen.blit(title_surf, title_rect)

        # メニューオプション描画
        for i, option in enumerate(menu_options):
            prefix = ">" if i == selected else "  "
            text_surf = menu_font.render(f"{prefix} {option}", True, WHITE)
            text_rect = text_surf.get_rect(center=(WIDTH // 2, 5*HEIGHT // 8 - 30 + i * 60))
            screen.blit(text_surf, text_rect)

        pygame.display.flip()
        clock.tick(60)

        # イベント処理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    selected = (selected - 1) % len(menu_options)
                elif event.key == pygame.K_DOWN:
                    selected = (selected + 1) % len(menu_options)
                elif event.key == pygame.K_RETURN:
                    if selected == 0:
                        return  # ゲーム再開
                    elif selected == 1:
                        fade_out(screen)
                        return "quit"  # タイトル画面などへ戻る指示