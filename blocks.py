import pygame
from const import OBJECT_SIZE
from util import resource_path

# ブロック画像の読み込み
def load_block_image():
    path = resource_path("img/block.png")
    image = pygame.image.load(path).convert_alpha()
    return pygame.transform.scale(image, (OBJECT_SIZE, OBJECT_SIZE))

# ブロックRectオブジェクトを作成
def create_blocks(positions):
    return [pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE) for x, y in positions]