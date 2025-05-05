import pygame
from const import OBJECT_SIZE
from util import resource_path

# 鍵画像とアイコンの読み込み
def load_key_image():
    key_img_path = resource_path("img/key.png")
    key_image = pygame.image.load(key_img_path).convert_alpha()
    key_image = pygame.transform.scale(key_image, (OBJECT_SIZE, OBJECT_SIZE))
    
    # 鍵アイコン設定（小さく表示する用）
    key_icon_size = 30
    key_icon = pygame.transform.scale(key_image, (key_icon_size, key_icon_size))
    
    return key_image, key_icon

# プレイヤーとの描画オフセット（アイコン用）
offset_x = 40
offset_y = -20

def load_key_image_how_to_play():
    key_img_path = resource_path("img/key.png")
    key_image = pygame.image.load(key_img_path).convert_alpha()
    key_image = pygame.transform.scale(key_image, (OBJECT_SIZE, OBJECT_SIZE))
    
    return key_image