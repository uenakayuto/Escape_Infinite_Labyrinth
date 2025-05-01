import pygame
from const import OBJECT_SIZE
from util import resource_path

# ブロック画像の読み込み
def load_block_image():
    path = resource_path("img/block.png")
    image = pygame.image.load(path).convert_alpha()
    return pygame.transform.scale(image, (OBJECT_SIZE, OBJECT_SIZE))

# ブロック配置（仮に固定 or 将来ランダムに）
def generate_block_positions():
    # ここをランダムに後で変更できる
    return [
        (300, 180),
        (360, 180),
        (420, 180),
        (660, 720),
    ]

# ブロックRectオブジェクトを作成
def create_blocks(positions):
    return [pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE) for x, y in positions]