import pygame
from util import resource_path  # PyInstaller対策済みの安全なパス取得関数

pygame.mixer.init()

def load_sound(file_path, volume=1.0):
    """指定されたファイルパスから音声を読み込む関数"""
    sound = pygame.mixer.Sound(resource_path(file_path))
    sound.set_volume(volume)  # 音量調整
    return sound

# 効果音の読み込み
se_game_start = load_sound("se/game_start.ogg")
se_menu_select = load_sound("se/menu_select.ogg")
se_cursor = load_sound("se/cursor.ogg")
se_fade_in_game = load_sound("se/fade_in_game.ogg", 0.8)
se_countdown = load_sound("se/countdown.ogg")
se_game_start_game = load_sound("se/game_start_game.ogg")
se_get_key = load_sound("se/get_key.ogg")
se_goal = load_sound("se/goal.ogg")
se_game_over = load_sound("se/game_over.ogg")
se_select_credits = load_sound("se/select_credits.ogg")