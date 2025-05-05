import os
import sys
import pygame

# 画像パスを正しく解決する（PyInstaller対応）
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS  # PyInstaller で作ったときの一時フォルダ
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# 画像の読み込みとリサイズ
def load_scaled_image(path, size):
    full_path = resource_path(path)
    image = pygame.image.load(full_path).convert_alpha()
    return pygame.transform.scale(image, (size, size))