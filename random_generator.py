import random
from const import OBJECT_SIZE, WIDTH, HEIGHT
from enemy import Enemy
from player import Player

def get_valid_positions(margin=OBJECT_SIZE):
    positions = []
    for x in range(margin, WIDTH - margin, OBJECT_SIZE):
        for y in range(margin, HEIGHT - margin, OBJECT_SIZE):
            positions.append((x, y))
    return positions

def sample_unique_positions(count, exclude=set()):
    valid_positions = [pos for pos in get_valid_positions() if pos not in exclude]
    return random.sample(valid_positions, count)

def generate_random_player():
    pos = sample_unique_positions(1)[0]
    return Player(pos[0], pos[1]), pos

def generate_random_blocks(used_positions):
    num_blocks = random.randint(0, 10)
    blocks = sample_unique_positions(num_blocks, used_positions)
    return blocks

def generate_random_key(used_positions):
    return sample_unique_positions(1, used_positions)[0]

def generate_random_goal(used_positions):
    return sample_unique_positions(1, used_positions)[0]

def generate_random_enemies(player_pos, used_positions):
    num_enemies = random.randint(1, 8)
    valid_positions = [
        pos for pos in get_valid_positions()
        if pos not in used_positions and pos[0] != player_pos[0] and pos[1] != player_pos[1]
    ]
    selected_positions = random.sample(valid_positions, num_enemies)
    
    enemies = []
    for x, y in selected_positions:
        direction = random.choice([-1, 1])
        speed = random.randint(2, 10)
        vertical = random.choice([True, False])
        enemies.append(Enemy(x, y, direction=direction, speed=speed, vertical=vertical))
    return enemies