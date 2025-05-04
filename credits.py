import pygame
import sys
from const import WIDTH, HEIGHT, WHITE, BLACK, FONT_SIZE_MENU, FONT_SIZE_GAME_TITLE
from fade import fade_out
from se_manager import se_select_credits

def show_credits(screen):
    pygame.font.init()
    clock = pygame.time.Clock()

    title_font = pygame.font.SysFont(None, FONT_SIZE_GAME_TITLE)  # 大きなタイトル
    subtitle_font = pygame.font.SysFont(None, FONT_SIZE_MENU + 30)  # 小見出し
    text_font = pygame.font.SysFont(None, FONT_SIZE_MENU)          # 通常テキスト

    scroll_speed = 5
    scroll_interval = 10  # ミリ秒ごとのスクロール
    last_scroll_time = 0

    # クレジット内容
    credits = [
        ("heading", "Credits"),
        ("blank", ""),
        ("subtitle", "Game Design, Programming,"),
        ("subtitle", "Graphics, Sounds"),
        ("text", "Yuto Uenaka"),
        ("blank", ""),
        ("subtitle", "Development Tools"),
        ("text", "pygame"),
        ("blank", ""),
        ("subtitle", "Graphics Tools"),
        ("text", "Microsoft PowerPoint"),
        ("blank", ""),
        ("subtitle", "BGM Tools"),
        ("text", "Vidnoz AI"),
        ("blank", ""),
        ("subtitle", "SE Tools"),
        ("text", "Bfxr"),
        ("blank", ""),
        ("subtitle", "Special Thanks"),
        ("text", "ChatGPT"),
        ("blank", ""),
        ("center", "Press ENTER to return to title"),
    ]

    # 高さを見積もって最大スクロール量を計算
    estimated_height = 50
    for type_, content, *_ in credits:
        if type_ == "heading":
            estimated_height += 100
        elif type_ == "subtitle":
            estimated_height += 80
        elif type_ == "text":
            estimated_height += 60
        elif type_ == "blank":
            estimated_height += 80
        elif type_ == "center":
            estimated_height += 40

    scroll_offset = 0
    max_scroll = max(0, estimated_height - HEIGHT + 60)

    while True:
        screen.fill(BLACK)
        draw_y = 50  # 最初の位置

        for entry in credits:
            type_ = entry[0]
            content = entry[1]

            if draw_y - scroll_offset > HEIGHT:
                break

            if type_ == "heading":
                surf = title_font.render(content, True, WHITE)
                rect = surf.get_rect(center=(WIDTH // 2, draw_y + surf.get_height() // 2 - scroll_offset))
                screen.blit(surf, rect)
                draw_y += 100
            elif type_ == "subtitle":
                surf = subtitle_font.render(content, True, WHITE)
                screen.blit(surf, (60, draw_y - scroll_offset))
                draw_y += 80
            elif type_ == "text":
                surf = text_font.render(content, True, WHITE)
                screen.blit(surf, (80, draw_y - scroll_offset))
                draw_y += 60
            elif type_ == "blank":
                draw_y += 80
            elif type_ == "center":
                surf = text_font.render(content, True, WHITE)
                rect = surf.get_rect(center=(WIDTH // 2, draw_y + surf.get_height() // 2 - scroll_offset))
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
                    se_select_credits.play()
                    fade_out(screen, fade_bgm=False)
                    return