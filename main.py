import pygame
from title_screen import show_title_screen
from game import main_game
from const import WIDTH, HEIGHT, GAME_NAME
from fade import fade_out
from how_to_play import show_how_to_play
from records import show_records

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption(GAME_NAME)

    while True:
        selected = show_title_screen(screen)

        if selected == 0:
            fade_out(screen)
            main_game()  # 本編を開始
        elif selected == 1:
            fade_out(screen)
            show_how_to_play(screen)
        elif selected == 2:
            fade_out(screen)
            show_records(screen)

if __name__ == "__main__":
    main()