from collections import deque
from const import WIDTH, HEIGHT, OBJECT_SIZE
from random_generator import (
    generate_random_player, generate_random_blocks,
    generate_random_key, generate_random_goal,
    generate_random_enemies
)

def is_path_clear(start, goal, blocked_set):
    visited = set()
    queue = deque([start])
    directions = [(0, OBJECT_SIZE), (0, -OBJECT_SIZE), (OBJECT_SIZE, 0), (-OBJECT_SIZE, 0)]

    while queue:
        current = queue.popleft()
        if current == goal:
            return True
        if current in visited:
            continue
        visited.add(current)

        for dx, dy in directions:
            next_pos = (current[0] + dx, current[1] + dy)
            if (
                0 <= next_pos[0] < WIDTH and
                0 <= next_pos[1] < HEIGHT and
                next_pos not in blocked_set and
                next_pos not in visited
            ):
                queue.append(next_pos)
    return False

def generate_valid_map():
    while True:
        try:
            used_positions = set()

            # プレイヤー生成
            player, player_pos = generate_random_player()
            used_positions.add(player_pos)

            # ブロック生成
            blocks = generate_random_blocks(used_positions)
            used_positions.update(blocks)

            # 鍵とゴール生成
            key_pos = generate_random_key(used_positions)
            used_positions.add(key_pos)
            goal_pos = generate_random_goal(used_positions)
            used_positions.add(goal_pos)

            # 敵の位置確保（あくまで経路確認用）
            enemies = generate_random_enemies(player_pos, used_positions, set(blocks))
            enemy_positions = set((e.rect.x, e.rect.y) for e in enemies)

            # 壁と敵をブロックとして扱う
            blocked_set = set(blocks) | enemy_positions

            # 経路確認
            if not is_path_clear(player_pos, key_pos, blocked_set):
                continue
            if not is_path_clear(key_pos, goal_pos, blocked_set):
                continue

            # すべての条件を満たしたら return
            return player, blocks, key_pos, goal_pos, enemies

        except ValueError:
            continue  # サンプリング失敗時も再生成