import pygame
from const import OBJECT_SIZE
from util import load_scaled_image

# ブロック画像の読み込み
def load_block_image():
    return load_scaled_image("img/block.png", OBJECT_SIZE)

# ブロックRectオブジェクトを作成
def create_blocks(positions):
    return [pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE) for x, y in positions]