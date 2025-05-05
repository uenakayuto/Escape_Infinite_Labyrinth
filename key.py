import pygame
from const import OBJECT_SIZE
from util import load_scaled_image

# 鍵画像とアイコンの読み込み
def load_key_image():
    key_image = load_scaled_image("img/key.png", OBJECT_SIZE)
    
    # 鍵アイコン設定（小さく表示する用）
    key_icon_size = 30
    key_icon = pygame.transform.scale(key_image, (key_icon_size, key_icon_size))
    
    return key_image, key_icon

def load_key_image_how_to_play():
    return load_scaled_image("img/key.png", OBJECT_SIZE)