import pygame
from const import WIDTH, HEIGHT, FADE_SPEED, FADE_DELAY, BLACK

def fade_out(screen, speed=FADE_SPEED, fade_bgm=True):
    fade_surface = pygame.Surface((WIDTH, HEIGHT))
    fade_surface.fill(BLACK)

    # BGMが流れている場合
    if pygame.mixer.music.get_busy():
        current_volume = pygame.mixer.music.get_volume()  # 現在のBGM音量を取得
        
        for alpha in range(0, 256, speed):
            fade_surface.set_alpha(alpha)
            screen.blit(fade_surface, (0, 0))
            pygame.display.update()
            pygame.time.delay(FADE_DELAY)
            
            if fade_bgm:  # BGM音量を下げる場合
                new_volume = max(0.0, current_volume - (alpha / 256.0))
                pygame.mixer.music.set_volume(new_volume)
            # fade_bgmがFalseの場合、音量はそのまま維持される

    else:
        # BGMが流れていない場合は従来通り
        for alpha in range(0, 256, speed):
            fade_surface.set_alpha(alpha)
            screen.blit(fade_surface, (0, 0))
            pygame.display.update()
            pygame.time.delay(FADE_DELAY)

def fade_in(screen, draw_func, speed=FADE_SPEED):
    fade_surface = pygame.Surface((WIDTH, HEIGHT))
    fade_surface.fill(BLACK)

    for alpha in reversed(range(0, 256, speed)):
        draw_func()
        fade_surface.set_alpha(alpha)
        screen.blit(fade_surface, (0, 0))
        pygame.display.update()
        pygame.time.delay(FADE_DELAY)