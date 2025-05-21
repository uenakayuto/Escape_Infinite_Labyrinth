import pygame
import sys
from const import WIDTH, HEIGHT, GAME_NAME, FONT_SIZE_GAME_TITLE, FONT_SIZE_MENU, FONT_SIZE_TITLE_CREDITS, WHITE, BLACK
from util import resource_path
from se_manager import se_cursor

def show_title_screen(screen):
    background_path = resource_path("img/title_screen.png")
    background_image = pygame.image.load(background_path).convert()
    background_image = pygame.transform.scale(background_image, (WIDTH, HEIGHT))

    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)
    menu_font = pygame.font.SysFont(None, FONT_SIZE_MENU)
    credits_font = pygame.font.SysFont(None, FONT_SIZE_TITLE_CREDITS)

    menu_items = ["Game Start", "How to Play", "Records"]
    selected_index = 0

    clock = pygame.time.Clock()

    while True:
        screen.fill(BLACK)
        screen.blit(background_image, (0, 0))

        # タイトル描画
        title_text = title_font.render(GAME_NAME, True, WHITE)
        title_rect = title_text.get_rect(center=(WIDTH // 2, HEIGHT // 3))
        screen.blit(title_text, title_rect)

        # メニュー描画
        for i, item in enumerate(menu_items):
            prefix = ">" if i == selected_index else "  "
            text = menu_font.render(prefix + item, True, WHITE)
            text_rect = text.get_rect(center=(WIDTH // 2, HEIGHT // 2 + i * 60))
            screen.blit(text, text_rect)

        # Credits ボタン
        credits_text = credits_font.render("Credits [C]", True, WHITE)
        credits_rect = credits_text.get_rect(midbottom=(WIDTH // 2, HEIGHT - 10))
        screen.blit(credits_text, credits_rect)

        pygame.display.flip()
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT or (
                event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                pygame.quit()
                sys.exit()

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    selected_index = (selected_index - 1) % len(menu_items)
                    se_cursor.play()

                elif event.key == pygame.K_DOWN:
                    selected_index = (selected_index + 1) % len(menu_items)
                    se_cursor.play()

                elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                    return selected_index

                elif event.key == pygame.K_c:
                    return "credits"