import pygame
import sys
from const import WIDTH, HEIGHT, GAME_NAME, FONT_SIZE_GAME_TITLE, FONT_SIZE_MENU, WHITE, BLACK
from util import resource_path

def show_title_screen(screen):
    background_path = resource_path("img/title_screen.png")
    background_image = pygame.image.load(background_path).convert()
    background_image = pygame.transform.scale(background_image, (WIDTH, HEIGHT))
    # タイトルとメニューのフォント
    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)  # タイトル用（大きめ）
    menu_font = pygame.font.SysFont(None, FONT_SIZE_MENU)   # メニュー用（小さめ）

    # メニュー項目（選択肢）
    menu_items = ["Game Start", "How to Play", "Records"]
    selected_index = 0  # 最初に選ばれている項目

    clock = pygame.time.Clock()

    while True:
        screen.fill(BLACK)  # 画面を黒でクリア
        screen.blit(background_image, (0, 0))

        # タイトルの描画（画面上半分中央）
        title_text = title_font.render(GAME_NAME, True, WHITE)
        title_rect = title_text.get_rect(center=(WIDTH // 2, HEIGHT // 3))
        screen.blit(title_text, title_rect)

        # メニューの描画（下半分）
        for i, item in enumerate(menu_items):
            # 選択中の項目に三角カーソルを付けて表示
            prefix = ">" if i == selected_index else "  "
            color = WHITE
            text = menu_font.render(prefix + item, True, color)
            text_rect = text.get_rect(center=(WIDTH // 2, HEIGHT // 2 + i * 60))
            screen.blit(text, text_rect)

        pygame.display.flip()
        clock.tick(60)

        # 入力処理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:  # Escキーが押された場合
                    pygame.quit()
                    sys.exit()
                elif event.key == pygame.K_UP:
                    selected_index = (selected_index - 1) % len(menu_items)
                elif event.key == pygame.K_DOWN:
                    selected_index = (selected_index + 1) % len(menu_items)
                elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                    return selected_index  # 選ばれたインデックスを返す