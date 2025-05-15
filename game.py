import pygame
import sys
from const import OBJECT_SIZE, GAME_NAME, BLACK, RED, WHITE, FONT_SIZE_RED, FONT_SIZE_FLOOR_TIME, FONT_SIZE_COUNTDOWN, FPS, OFFSET_X, OFFSET_Y, WIDTH, HEIGHT
from database import init_db, save_game_result
from wall_blocks import load_wall_image, generate_wall_blocks
from blocks import load_block_image, create_blocks
from key import load_key_image
from goal import load_goal_image
from fade import fade_in, fade_out
from countdown import countdown
from se_manager import se_fade_in_game, se_game_start_game, se_get_key, se_goal, se_game_over, se_menu_select
from bgm_manager import play_bgm, bgm_game
from canclearcheck import generate_valid_map
from pause import show_pause_menu
from logic import handle_enemy_collisions
from result_screen import show_result_screen

def main_game():
    # データベースの初期化
    init_db()
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption(GAME_NAME)
    font_red = pygame.font.SysFont(None, FONT_SIZE_RED)
    font_white = pygame.font.SysFont(None, FONT_SIZE_FLOOR_TIME)
    font_countdown = pygame.font.SysFont(None, FONT_SIZE_COUNTDOWN)
    
    clock = pygame.time.Clock()

    game_over = False
    stage_num = 0

    while not game_over:
        # ===== ステージの初期化 =====
        player, block_positions, key_pos, goal_pos, enemies = generate_valid_map()

        # ブロック
        block_image = load_block_image()
        blocks = create_blocks(block_positions)

        # 鍵
        key_collected = False
        key_image, key_icon = load_key_image()

        # ゴール
        goal_image = load_goal_image()

        # 壁
        wall_image = load_wall_image()
        wall_blocks = generate_wall_blocks()

        key_se = None

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

            se_fade_in_game.play()  # フェードインSE
            fade_in(screen, draw)

            countdown(screen, font_countdown, draw)  # カウントダウンを表示
            se_game_start_game.play()  # ゲームスタートSE
            play_bgm(bgm_game)  # ゲームBGMを再生
            start_time = pygame.time.get_ticks()
            paused_time_total = 0
            pause_start_time = None
            is_paused = False

        # ===== ステージ内ループ =====
        while not stage_clear and not game_over:
            clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        if not is_paused:
                            pause_start_time = pygame.time.get_ticks()
                            is_paused = True
                            pygame.mixer.pause()
                            pygame.mixer.music.pause()
                            pause_result = show_pause_menu(screen)
                            if pause_result == "quit":
                                pygame.mixer.stop()
                                pygame.mixer.music.stop()
                                pygame.mixer.unpause()
                                pygame.mixer.music.unpause()
                                return  # タイトルに戻る
                            # 再開処理
                            pygame.mixer.unpause()
                            pygame.mixer.music.unpause()
                            paused_time_total += pygame.time.get_ticks() - pause_start_time
                            pause_start_time = None
                            is_paused = False

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
            if not key_collected:
                key_rect = pygame.Rect(key_pos[0] + OBJECT_SIZE/6, key_pos[1], OBJECT_SIZE*2/3, OBJECT_SIZE)
                if player_rect.colliderect(key_rect):                
                    key_se = se_get_key.play()
                    key_collected = True

            # ゴールとの衝突
            goal_rect = pygame.Rect(goal_pos[0], goal_pos[1], OBJECT_SIZE, OBJECT_SIZE)
            if key_collected and player_rect.colliderect(goal_rect):
                if not stage_clear:
                    if key_se is not None:
                        key_se.stop()
                    se_goal.play()
                    text = font_red.render("STAGE CLEAR!", True, RED)
                    text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
                    stage_clear = True

            # 敵との衝突
            if not stage_clear:
                for enemy in enemies:
                    if player_rect.colliderect(enemy.rect):
                        if not game_over:
                            pygame.mixer.stop()
                            pygame.mixer.music.stop()
                            se_game_over.play()
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
            elapsed_time = pygame.time.get_ticks() - start_time - paused_time_total
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

            screen.blit(goal_image, (goal_pos[0], goal_pos[1]))

            if not key_collected:
                screen.blit(key_image, (key_pos[0], key_pos[1]))
            else:
                screen.blit(key_icon, (player.rect.x + OFFSET_X, player.rect.y + OFFSET_Y))

            for enemy in enemies:
                enemy.draw(screen)

            player.draw(screen)

            if stage_clear or game_over:
                screen.blit(text, text_rect)

            pygame.display.update()

        # ステージ終了後の処理
        if not game_over:
            clear_time = time_str
        pygame.time.wait(1000)

    # ゲーム全体終了処理
    clear_floor = stage_num - 1
    if clear_floor > 0:
        save_game_result(clear_floor, clear_time)
    else:
        clear_time = "00:00.000"
    
    fade_out(screen)
    choice = show_result_screen(screen, clear_floor, clear_time)

    if choice == 0:
        se_menu_select.play()
        fade_out(screen)
        main_game()  # Play Again
    elif choice == 1:
        se_menu_select.play()
        fade_out(screen)
        return  # Return to Title
    elif choice == 2:
        pygame.quit()
        sys.exit()  # Quit the Game