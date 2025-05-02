import sqlite3
import pygame
import os
from const import WIDTH, HEIGHT, BLACK, WHITE, FONT_SIZE_RECORDS, FONT_SIZE_FLOOR_TIME, FONT_SIZE_NO_RECORDS
from fade import fade_out

def format_time(seconds):
    minutes = int(seconds) // 60
    sec = int(seconds) % 60
    ms = int((seconds - int(seconds)) * 1000)
    return f"{minutes:02}:{sec:02}.{ms:03}"

def show_records(screen):
    # 初期化
    pygame.font.init()
    font_title = pygame.font.SysFont(None, FONT_SIZE_RECORDS)
    font_text = pygame.font.SysFont(None, FONT_SIZE_FLOOR_TIME)
    font_no_data = pygame.font.SysFont(None, FONT_SIZE_NO_RECORDS)
    clock = pygame.time.Clock()

    screen.fill(BLACK)

    # データ取得（なければ空リストに）
    records = []
    if os.path.exists("game_records.db"):
        try:
            conn = sqlite3.connect("game_records.db")
            c = conn.cursor()
            c.execute("SELECT cleared_floors, last_clear_time FROM records ORDER BY cleared_floors DESC, last_clear_time ASC LIMIT 5")
            records = c.fetchall()
            conn.close()
        except sqlite3.Error:
            pass

    # タイトル描画
    title_surf = font_title.render("Records", True, WHITE)
    screen.blit(title_surf, (WIDTH // 2 - title_surf.get_width() // 2, HEIGHT // 8))

    if not records:
        no_data_text = font_no_data.render("No Records", True, WHITE)
        screen.blit(no_data_text, (WIDTH // 2 - no_data_text.get_width() // 2, HEIGHT // 2))
    else:
        spacing = 50
        num_rows = len(records) + 1
        total_height = num_rows * spacing
        start_y = HEIGHT // 2 - total_height // 2
        header_x_positions = [WIDTH // 4, WIDTH // 2, WIDTH * 3 // 4]

        headers = ["Ranking", "Floors", "Time"]
        for i, h in enumerate(headers):
            text = font_text.render(h, True, WHITE)
            screen.blit(text, (header_x_positions[i] - text.get_width() // 2, start_y))

        for idx, (floor, time) in enumerate(records):
            y = start_y + (idx + 1) * spacing
            rank_text = font_text.render(str(idx + 1), True, WHITE)
            floor_text = font_text.render(f"{floor}F", True, WHITE)
            time_text = font_text.render(str(time), True, WHITE)  # フォーマットせずそのまま表示

            screen.blit(rank_text, (header_x_positions[0] - rank_text.get_width() // 2, y))
            screen.blit(floor_text, (header_x_positions[1] - floor_text.get_width() // 2, y))
            screen.blit(time_text, (header_x_positions[2] - time_text.get_width() // 2, y))

    info_text = font_text.render("Press ENTER to return to title", True, WHITE)
    screen.blit(info_text, (WIDTH // 2 - info_text.get_width() // 2, HEIGHT - 60))

    pygame.display.update()

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
                fade_out(screen)
                return
        clock.tick(60)