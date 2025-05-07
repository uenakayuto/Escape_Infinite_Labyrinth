from const import OBJECT_SIZE, WIDTH, HEIGHT
from util import load_scaled_image

# 壁画像の読み込み関数（再利用可能にする）
def load_wall_image():
    return load_scaled_image("img/block.png", OBJECT_SIZE)

# 壁の座標を生成
def generate_wall_blocks():
    wall_blocks = []

    cols = WIDTH // OBJECT_SIZE
    rows = HEIGHT // OBJECT_SIZE

    # 上下の壁
    for x in range(cols):
        wall_blocks.append((x * OBJECT_SIZE, 0))  # 上端
        wall_blocks.append((x * OBJECT_SIZE, (rows - 1) * OBJECT_SIZE))  # 下端

    # 左右の壁
    for y in range(1, rows - 1):
        wall_blocks.append((0, y * OBJECT_SIZE))  # 左端
        wall_blocks.append(((cols - 1) * OBJECT_SIZE, y * OBJECT_SIZE))  # 右端

    return wall_blocks