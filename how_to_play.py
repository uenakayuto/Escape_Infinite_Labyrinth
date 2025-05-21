import pygame
import sys
from const import WIDTH, HEIGHT, WHITE, BLACK, FONT_SIZE_MENU, FONT_SIZE_GAME_TITLE
from fade import fade_out
from player import load_player_image
from key import load_key_image_how_to_play
from goal import load_goal_image
from enemy import load_enemy_image
from blocks import load_block_image
from se_manager import se_menu_select

def show_how_to_play(screen):
    pygame.font.init()
    clock = pygame.time.Clock()

    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)  # 大きなタイトル
    subtitle_font = pygame.font.SysFont(None, FONT_SIZE_MENU + 30)  # 小見出し
    text_font = pygame.font.SysFont(None, FONT_SIZE_MENU)          # 通常テキスト

    line_spacing = 10

    scroll_speed = 5
    scroll_interval = 10  # ミリ秒ごとのスクロール
    last_scroll_time = 0

    # 説明と画像データ
    instructions = [
        ("heading", "How to Play"),
        ("blank", ""),
        ("subtitle", "Goal"),
        ("text", "Clear as many floors as quickly as possible!"),
        ("blank", ""),
        ("subtitle", "Controls"),
        ("text", "Arrow keys - Move"),
        ("text", "Esc - Pause"),
        ("blank", ""),
        ("subtitle", "Rules"),
        ("image_text", ["Move the player using the arrow keys."], load_player_image()),
        ("image_text", ["Pick up the key to activate the goal."], load_key_image_how_to_play()),
        ("image_text", ["Reach the goal while holding the key", "to clear the floor."], load_goal_image()),
        ("image_text", ["Touching an enemy results in a game over."], load_enemy_image()),
        ("image_text", ["You cannot pass through blocks."], load_block_image()),
        ("blank", ""),
        ("center", "Press ENTER to return to title"),
    ]

    # 高さを見積もって最大スクロール量を計算
    estimated_height = 50
    for type_, content, *_ in instructions:
        if type_ == "heading":
            estimated_height += 100
        elif type_ == "subtitle":
            estimated_height += 80
        elif type_ == "text":
            estimated_height += 60
        elif type_ == "image_text":
            estimated_height += 60 * len(content) + 10
        elif type_ == "blank":
            estimated_height += 80
        elif type_ == "center":
            estimated_height += 40

    scroll_offset = 0
    max_scroll = max(0, estimated_height - HEIGHT + 60)

    while True:
        screen.fill(BLACK)
        draw_y = 50 - scroll_offset  # 50: 上の余白

        for entry in instructions:
            type_ = entry[0]
            content = entry[1]
            image = entry[2] if len(entry) > 2 else None

            if draw_y > HEIGHT:
                break

            if type_ == "heading":
                surf = title_font.render(content, True, WHITE)
                rect = surf.get_rect(center=(WIDTH // 2, draw_y + surf.get_height() // 2))
                screen.blit(surf, rect)
                draw_y += 100
            elif type_ == "subtitle":
                surf = subtitle_font.render(content, True, WHITE)
                screen.blit(surf, (60, draw_y))
                draw_y += 80
            elif type_ == "text":
                surf = text_font.render(content, True, WHITE)
                screen.blit(surf, (80, draw_y))
                draw_y += 60
            elif type_ == "image_text":
                img = pygame.transform.scale(image, (50, 50))
                screen.blit(img, (60, draw_y))
                for i, line in enumerate(content):
                    surf = text_font.render(line, True, WHITE)
                    screen.blit(surf, (120, draw_y))
                    draw_y += 60
                draw_y += line_spacing
            elif type_ == "blank":
                draw_y += 80
            elif type_ == "center":
                surf = text_font.render(content, True, WHITE)
                rect = surf.get_rect(center=(WIDTH // 2, draw_y + surf.get_height() // 2))
                screen.blit(surf, rect)
                draw_y += 40

        pygame.display.flip()
        clock.tick(60)

        # 現在の時刻を取得
        current_time = pygame.time.get_ticks()

        # 長押しスクロール対応
        keys = pygame.key.get_pressed()
        if keys[pygame.K_DOWN] and current_time - last_scroll_time > scroll_interval:
            scroll_offset = min(scroll_offset + scroll_speed, max_scroll)
            last_scroll_time = current_time
        elif keys[pygame.K_UP] and current_time - last_scroll_time > scroll_interval:
            scroll_offset = max(scroll_offset - scroll_speed, 0)
            last_scroll_time = current_time

        # イベント処理（通常のキー入力など）
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    se_menu_select.play()
                    fade_out(screen, fade_bgm=False)
                    return True