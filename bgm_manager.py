import pygame
from util import resource_path  # PyInstaller対策済みの安全なパス取得関数

pygame.mixer.init()

def play_bgm(bgm_path, volume=1.0, loop=True):
    pygame.mixer.music.load(bgm_path)
    pygame.mixer.music.set_volume(volume)
    pygame.mixer.music.play(-1 if loop else 0)

# bgmの読み込み
bgm_title = resource_path("bgm/title.ogg")
bgm_game = resource_path("bgm/game.ogg")