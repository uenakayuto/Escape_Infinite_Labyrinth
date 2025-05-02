import pygame
from const import WIDTH, HEIGHT, FADE_SPEED

def fade_out(screen, speed=FADE_SPEED):
    fade_surface = pygame.Surface((WIDTH, HEIGHT))
    fade_surface.fill((0, 0, 0))

    for alpha in range(0, 256, speed):
        fade_surface.set_alpha(alpha)
        screen.blit(fade_surface, (0, 0))
        pygame.display.update()
        pygame.time.delay(30)

def fade_in(screen, draw_func, speed=FADE_SPEED):
    fade_surface = pygame.Surface((WIDTH, HEIGHT))
    fade_surface.fill((0, 0, 0))

    for alpha in reversed(range(0, 256, speed)):
        draw_func()
        fade_surface.set_alpha(alpha)
        screen.blit(fade_surface, (0, 0))
        pygame.display.update()
        pygame.time.delay(30)