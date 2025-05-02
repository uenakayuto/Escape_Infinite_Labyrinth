import random
from const import OBJECT_SIZE, WIDTH, HEIGHT, NUM_BLOCKS, NUM_ENEMIES
from enemy import Enemy
from player import Player

def get_valid_positions(margin=OBJECT_SIZE):
    positions = []
    for x in range(margin, WIDTH - margin, OBJECT_SIZE):
        for y in range(margin, HEIGHT - margin, OBJECT_SIZE):
            positions.append((x, y))
    return positions

def sample_unique_positions(count, exclude=set(), max_same_x=None, max_same_y=None):
    valid_positions = [pos for pos in get_valid_positions() if pos not in exclude]

    # カウント用
    x_count = {}
    y_count = {}
    selected = []

    random.shuffle(valid_positions)
    for pos in valid_positions:
        x, y = pos
        if pos in exclude:
            continue

        # x制限
        if max_same_x is not None and x_count.get(x, 0) >= max_same_x:
            continue

        # y制限
        if max_same_y is not None and y_count.get(y, 0) >= max_same_y:
            continue

        selected.append(pos)
        x_count[x] = x_count.get(x, 0) + 1
        y_count[y] = y_count.get(y, 0) + 1

        if len(selected) >= count:
            break

    if len(selected) < count:
        raise ValueError("Valid positions could not be found with given constraints.")

    return selected

def generate_random_player():
    pos = sample_unique_positions(1)[0]
    return Player(pos[0], pos[1]), pos

def generate_random_blocks(used_positions):
    # num_blocks = random.randint(0, 10)
    num_blocks = NUM_BLOCKS
    blocks = sample_unique_positions(num_blocks, exclude=used_positions, max_same_x=3, max_same_y=3)
    return blocks

def generate_random_key(used_positions):
    return sample_unique_positions(1, used_positions)[0]

def generate_random_goal(used_positions):
    return sample_unique_positions(1, used_positions)[0]

def generate_random_enemies(player_pos, used_positions):
    num_enemies = NUM_ENEMIES

    # プレイヤーの x, y を取得
    px, py = player_pos

    # 新しい条件付きサンプリング
    valid_positions = [
        pos for pos in get_valid_positions()
        if pos not in used_positions and pos[0] != px and pos[1] != py
    ]

    if len(valid_positions) < num_enemies:
        raise ValueError("敵を配置できる十分な位置がありません。")

    selected_positions = random.sample(valid_positions, num_enemies)

    enemies = []
    for x, y in selected_positions:
        direction = random.choice([-1, 1])
        speed = random.randint(2, 10)
        vertical = random.choice([True, False])
        enemies.append(Enemy(x, y, direction=direction, speed=speed, vertical=vertical))
    return enemies