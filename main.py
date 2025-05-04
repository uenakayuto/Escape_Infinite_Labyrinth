import pygame
from title_screen import show_title_screen
from bgm_manager import bgm_title, play_bgm
from se_manager import se_game_start, se_menu_select, se_select_credits
from game import main_game
from const import WIDTH, HEIGHT, GAME_NAME
from fade import fade_out
from how_to_play import show_how_to_play
from records import show_records
from credits import show_credits

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption(GAME_NAME)

    back_from_htp_or_rec = False

    while True:
        if not back_from_htp_or_rec:
            play_bgm(bgm_title)  # タイトル画面のBGMを再生
        back_from_htp_or_rec = False
        selected = show_title_screen(screen)

        if selected == 0:
            se_game_start.play()
            fade_out(screen)
            main_game()  # 本編を開始
        elif selected == 1:
            se_menu_select.play()
            fade_out(screen, fade_bgm=False)
            back_from_htp_or_rec = show_how_to_play(screen)
        elif selected == 2:
            se_menu_select.play()
            fade_out(screen, fade_bgm=False)
            back_from_htp_or_rec = show_records(screen)
        elif selected == "credits":
            se_select_credits.play()
            fade_out(screen)
            # クレジット画面を表示する関数を呼び出す
            show_credits(screen)

if __name__ == "__main__":
    main()