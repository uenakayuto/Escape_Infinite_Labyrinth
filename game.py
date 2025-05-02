import pygame
import sys
from const import OBJECT_SIZE, GAME_NAME, BLACK, RED, WHITE, FONT_SIZE_RED, FONT_SIZE_WHITE, FONT_SIZE_COUNTDOWN, FPS, OFFSET_X, OFFSET_Y, WIDTH, HEIGHT
from database import init_db, save_game_result
from wall_blocks import load_wall_image, generate_wall_blocks
from blocks import load_block_image, create_blocks
from key import load_key_image
from goal import load_goal_images
from fade import fade_in
from countdown import countdown
from random_generator import (
    generate_random_player, generate_random_blocks, generate_random_key,
    generate_random_goal, generate_random_enemies
)
from logic import handle_enemy_collisions

def main_game():
    # データベースの初期化
    init_db()
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption(GAME_NAME)
    font_red = pygame.font.SysFont(None, FONT_SIZE_RED)
    font_white = pygame.font.SysFont(None, FONT_SIZE_WHITE)
    font_countdown = pygame.font.SysFont(None, FONT_SIZE_COUNTDOWN)
    
    clock = pygame.time.Clock()

    game_over = False
    stage_num = 0
    start_time = pygame.time.get_ticks()

    while not game_over:
        # ===== ステージの初期化 =====
        player, player_pos = generate_random_player()
        used_positions = set()
        used_positions.add(player_pos)

        # ブロック
        block_image = load_block_image()
        block_positions = generate_random_blocks(used_positions)
        blocks = create_blocks(block_positions)
        used_positions.update(block_positions)

        # 鍵
        key_collected = False
        key_image, key_icon = load_key_image()
        key_pos = generate_random_key(used_positions)
        used_positions.add(key_pos)

        # ゴール
        goal_image = load_goal_images()
        goal_pos = generate_random_goal(used_positions)
        used_positions.add(goal_pos)

        # 敵
        enemies = generate_random_enemies(player_pos, used_positions)

        # 壁
        wall_image = load_wall_image()
        wall_blocks = generate_wall_blocks()

        stage_clear = False

        stage_num += 1

        if stage_num == 1:
            def draw():
                screen.fill(BLACK)

                for wall in wall_blocks:
                    screen.blit(wall_image, wall)
                for pos in block_positions:
                    screen.blit(block_image, pos)
                screen.blit(key_image, key_pos)
                screen.blit(goal_image, goal_pos)
                for enemy in enemies:
                    enemy.draw(screen)
                player.draw(screen)

            fade_in(screen, draw)

            countdown(screen, font_countdown, draw)  # カウントダウンを表示

        # ===== ステージ内ループ =====
        while not stage_clear and not game_over:
            clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            # 入力処理
            keys = pygame.key.get_pressed()
            player.handle_input(keys, block_positions)

            # 敵の移動
            for enemy in enemies:
                enemy.move(blocks)
            handle_enemy_collisions(enemies)

            # 衝突判定
            player_rect = pygame.Rect(player.rect.topleft, (OBJECT_SIZE, OBJECT_SIZE))

            # 鍵との衝突
            key_rect = pygame.Rect(key_pos[0] + OBJECT_SIZE/6, key_pos[1], OBJECT_SIZE*2/3, OBJECT_SIZE)
            if player_rect.colliderect(key_rect):
                key_collected = True

            # ゴールとの衝突
            goal_rect = pygame.Rect(goal_pos[0], goal_pos[1], OBJECT_SIZE, OBJECT_SIZE)
            if key_collected and player_rect.colliderect(goal_rect):
                text = font_red.render("STAGE CLEAR!", True, RED)
                text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
                stage_clear = True

            # 敵との衝突
            for enemy in enemies:
                if player_rect.colliderect(enemy.rect):
                    player.set_failure()
                    text = font_red.render("GAME OVER", True, RED)
                    text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
                    game_over = True
                    break

            # ===== 描画処理 =====
            screen.fill(BLACK)

            for wall in wall_blocks:
                screen.blit(wall_image, wall)

            # --- ステージ数の表示（左上） ---
            stage_text = font_white.render(f"{stage_num}F", True, WHITE)
            screen.blit(stage_text, (10, 10))  # 左上余白10px

            # --- 経過タイムの表示（右上） ---
            elapsed_time = pygame.time.get_ticks() - start_time
            minutes = elapsed_time // 60000
            seconds = (elapsed_time % 60000) // 1000
            milliseconds = elapsed_time % 1000
            time_str = f"{minutes:02}:{seconds:02}.{milliseconds:03}"
            time_text = font_white.render(time_str, True, WHITE)
            time_rect = time_text.get_rect()
            time_rect.topleft = (WIDTH - 200, 10)  # 180px程度の固定幅スペースを確保
            screen.blit(time_text, time_rect)

            for pos in block_positions:
                screen.blit(block_image, pos)

            if not key_collected:
                screen.blit(key_image, (key_pos[0], key_pos[1]))
            else:
                screen.blit(key_icon, (player.rect.x + OFFSET_X, player.rect.y + OFFSET_Y))

            screen.blit(goal_image, (goal_pos[0], goal_pos[1]))

            for enemy in enemies:
                enemy.draw(screen)

            player.draw(screen)

            if stage_clear or game_over:
                screen.blit(text, text_rect)

            pygame.display.update()

        # ステージ終了後の処理
        if not game_over:
            clear_time = elapsed_time // 1000  # 秒単位
        pygame.time.wait(1000)

    # ゲーム全体終了処理
    save_game_result(stage_num - 1, clear_time)
    pygame.quit()
    sys.exit()