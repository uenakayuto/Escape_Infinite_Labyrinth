import pygame
import sys
from const import WIDTH, HEIGHT, WHITE, BLACK, FONT_SIZE_GAME_TITLE, FONT_SIZE_MENU

def show_result_screen(screen, clear_floor, clear_time):
    pygame.font.init()
    clock = pygame.time.Clock()

    # フォント
    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)
    menu_font = pygame.font.SysFont(None, FONT_SIZE_MENU)

    menu_items = ["Play Again", "Return to Title", "Quit the Game"]
    selected_index = 0

    # メニュー配置用
    button_spacing = 50
    return_to_title_index = 1
    base_y = (7 * HEIGHT // 8) - return_to_title_index * button_spacing

    while True:
        screen.fill(BLACK)

        # タイトル
        title_surface = title_font.render("Result", True, WHITE)
        title_rect = title_surface.get_rect(center=(WIDTH // 2, HEIGHT // 8))
        screen.blit(title_surface, title_rect)

        # 結果ヘッダー
        header_floor = menu_font.render("Floors", True, WHITE)
        header_time = menu_font.render("Time", True, WHITE)

        # "Floors" は左半分に配置、"Time" は右半分に配置
        screen.blit(header_floor, header_floor.get_rect(center=(WIDTH // 4, HEIGHT // 2 - 120)))
        screen.blit(header_time, header_time.get_rect(center=(WIDTH * 3 // 4, HEIGHT // 2 - 120)))

        # 結果データ
        floor_text = menu_font.render(f"{clear_floor}F", True, WHITE)
        time_text = menu_font.render(clear_time, True, WHITE)

        # "Floors" の下にスペースを確保して配置
        screen.blit(floor_text, floor_text.get_rect(center=(WIDTH // 4, HEIGHT // 2 - 40)))
        screen.blit(time_text, time_text.get_rect(center=(WIDTH * 3 // 4, HEIGHT // 2 - 40)))

        # メニュー項目
        for i, item in enumerate(menu_items):
            prefix = ">" if i == selected_index else "  "
            text_surface = menu_font.render(prefix + item, True, WHITE)
            text_rect = text_surface.get_rect(center=(WIDTH // 2, base_y + i * button_spacing))
            screen.blit(text_surface, text_rect)

        pygame.display.flip()
        clock.tick(60)

        # イベント処理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    selected_index = (selected_index - 1) % len(menu_items)
                elif event.key == pygame.K_DOWN:
                    selected_index = (selected_index + 1) % len(menu_items)
                elif event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
                    return selected_index
                elif event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()