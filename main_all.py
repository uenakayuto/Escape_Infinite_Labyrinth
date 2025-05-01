import pygame
import sys
import os

# 初期化
pygame.init()

# ディスプレイのサイズを取得
info = pygame.display.Info()
max_width = info.current_w
max_height = info.current_h

# 60 の倍数で最大になるように画面サイズを決定
object_size = 60
WIDTH = (max_width - 100) // object_size * object_size
HEIGHT = (max_height - 100) // object_size * object_size
print(f"画面サイズ: {WIDTH}x{HEIGHT}")

# 画面の作成（フルスクリーンではなくウィンドウモード）
screen = pygame.display.set_mode((WIDTH, HEIGHT))

pygame.display.set_caption("鍵を拾ってゴールへ！")

# 色
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# 画像パスを正しく解決する
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS  # PyInstallerで作ったとき専用
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# 壁画像の読み込み
wall_image_path = resource_path("img/block.png")
wall_image = pygame.image.load(wall_image_path).convert()
wall_image = pygame.transform.scale(wall_image, (object_size, object_size))

# 壁の座標リスト
wall_blocks = []

# 横に何個・縦に何個敷き詰められるか
cols = WIDTH // object_size
rows = HEIGHT // object_size

# 上下の壁
for x in range(cols):
    wall_blocks.append((x * object_size, 0))                     # 上端
    wall_blocks.append((x * object_size, (rows - 1) * object_size))  # 下端

# 左右の壁（角はすでに上記で追加されているので1〜rows-2）
for y in range(1, rows - 1):
    wall_blocks.append((0, y * object_size))                    # 左端
    wall_blocks.append(((cols - 1) * object_size, y * object_size))  # 右端

# ブロックの設定
block_positions = [
    (300, 180),
    (360, 180),
    (420, 180),
    (660, 720),
]
blocks = [pygame.Rect(x, y, object_size, object_size) for x, y in block_positions]
# ブロックの画像を読み込む
block_img_path = resource_path("img/block.png")
block_image = pygame.image.load(block_img_path).convert_alpha()
block_image = pygame.transform.scale(block_image, (object_size, object_size))

# 鍵
key_pos = [300, 300]
key_collected = False
# 鍵の画像を読み込む
key_img_path = resource_path("img/key.png")
key_image = pygame.image.load(key_img_path).convert_alpha()
key_image = pygame.transform.scale(key_image, (object_size, object_size))
# 鍵取得時のアイコン設定
offset_x = 40  # プレイヤー画像からの横方向オフセット
offset_y = -20  # プレイヤー画像からの縦方向オフセット
key_icon_size = 30  # 小さい鍵マークサイズ

# 鍵アイコンを縮小（必要なら）
key_icon = pygame.transform.scale(key_image, (key_icon_size, key_icon_size))

# ゴール
goal_pos = [540, 420]
# ゴールの画像を読み込む
goal_img_path = resource_path("img/goal.png")
goal_image = pygame.image.load(goal_img_path).convert_alpha()
goal_image = pygame.transform.scale(goal_image, (object_size, object_size))

# 敵の設定
class Enemy:
    def __init__(self, x, y, direction, speed, vertical=False):
        self.rect = pygame.Rect(x, y, object_size, object_size)
        self.speed = speed
        self.direction = direction  # -1 or 1
        self.vertical = vertical
        self.prev_pos = self.rect.topleft  # ← 前回位置の保存

        # 画像読み込み
        enemy_img_left_path = resource_path("img/enemy_look_left.png")
        self.image_left = pygame.image.load(enemy_img_left_path).convert_alpha()
        self.image_left = pygame.transform.scale(self.image_left, (object_size, object_size))
        self.image_right = pygame.transform.flip(self.image_left, True, False)

        enemy_img_up_path = resource_path("img/enemy_look_up.png")
        self.image_up = pygame.image.load(enemy_img_up_path).convert_alpha()
        self.image_up = pygame.transform.scale(self.image_up, (object_size, object_size))

        enemy_img_down_path = resource_path("img/enemy_look_down.png")
        self.image_down = pygame.image.load(enemy_img_down_path).convert_alpha()
        self.image_down = pygame.transform.scale(self.image_down, (object_size, object_size))

        self.image = self.get_image()

    def get_image(self):
        if self.vertical:
            return self.image_down if self.direction == 1 else self.image_up
        else:
            return self.image_right if self.direction == 1 else self.image_left

    def move(self, blocks):
        self.prev_pos = self.rect.topleft  # ← 移動前の位置を記録
        if self.vertical:
            self.rect.y += self.speed * self.direction
        else:
            self.rect.x += self.speed * self.direction

        # 壁との衝突チェック
        for block in blocks:
            if self.rect.colliderect(block):
                self.reverse()
                break

        # 画面端との衝突も反転
        if self.rect.left < object_size or self.rect.right > WIDTH - object_size or \
        self.rect.top < object_size or self.rect.bottom > HEIGHT - object_size:
            self.reverse()

    def draw(self, screen):
        screen.blit(self.image, self.rect.topleft)

    def reverse(self):
        self.direction *= -1
        self.rect.topleft = self.prev_pos  # ← 元の位置に戻す
        self.image = self.get_image()

enemies = [
    Enemy(1200, 600, direction=1, speed=2, vertical=True),
    Enemy(1200, 720, direction=-1, speed=10, vertical=True),
    Enemy(1200, 480, direction=-1, speed=3, vertical=True),
    Enemy(1200, 240, direction=1, speed=4, vertical=True),
]

# プレイヤー
player_pos = [60, 60]
player_speed = 10
old_player_pos = player_pos.copy()
# プレイヤー画像を読み込む
player_img_left_path = resource_path("img/player_look_left.png")
player_image_left = pygame.image.load(player_img_left_path).convert_alpha()
player_image_left = pygame.transform.scale(player_image_left, (object_size, object_size))
# 右向き画像を作る（左右反転）
player_image_right = pygame.transform.flip(player_image_left, True, False)
# 上向き画像
player_img_up_path = resource_path("img/player_look_up.png")
player_image_up = pygame.image.load(player_img_up_path).convert_alpha()
player_image_up = pygame.transform.scale(player_image_up, (object_size, object_size))
# 下向き画像
player_img_down_path = resource_path("img/player_look_down.png")
player_image_down = pygame.image.load(player_img_down_path).convert_alpha()
player_image_down = pygame.transform.scale(player_image_down, (object_size, object_size))
# やられた画像
player_img_failure_path = resource_path("img/player_failure.png")
player_image_failure = pygame.image.load(player_img_failure_path).convert_alpha()
player_image_failure = pygame.transform.scale(player_image_failure, (object_size, object_size))

if player_pos[0] > WIDTH / 2:
    player_image = player_image_left
else:
    player_image = player_image_right

# フォント
font = pygame.font.SysFont(None, 192)

# メインループ
clock = pygame.time.Clock()
notGameOver = True
notGoal = True
while notGameOver and notGoal:
    clock.tick(60)  # 60FPS

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # キー操作
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        player_pos[0] -= player_speed
        player_image = player_image_left
    if keys[pygame.K_RIGHT]:
        player_pos[0] += player_speed
        player_image = player_image_right
    if keys[pygame.K_UP]:
        player_pos[1] -= player_speed
        player_image = player_image_up
    if keys[pygame.K_DOWN]:
        player_pos[1] += player_speed
        player_image = player_image_down

    # 画面外に出ないように制御
    if player_pos[0] < object_size or player_pos[0] > WIDTH - object_size - object_size or player_pos[1] < object_size or player_pos[1] > HEIGHT - object_size - object_size:
        player_pos = old_player_pos.copy()

    # 敵の移動
    for enemy in enemies:
        enemy.move(blocks)

    # 敵同士の衝突
    for i in range(len(enemies)):
        for j in range(i + 1, len(enemies)):
            e1 = enemies[i]
            e2 = enemies[j]

            if e1.rect.colliderect(e2.rect):
                # 両者縦移動
                if e1.vertical and e2.vertical:
                    if e1.direction != e2.direction:
                        e1.reverse()
                        e2.reverse()
                    else:
                        if e1.speed > e2.speed:
                            e1.reverse()
                        elif e2.speed > e1.speed:
                            e2.reverse()
                        else:
                            # speed同じなら両者反転してもいい
                            e1.reverse()
                            e2.reverse()

                # 両者横移動
                elif not e1.vertical and not e2.vertical:
                    if e1.direction != e2.direction:
                        e1.reverse()
                        e2.reverse()
                    else:
                        if e1.speed > e2.speed:
                            e1.reverse()
                        elif e2.speed > e1.speed:
                            e2.reverse()
                        else:
                            e1.reverse()
                            e2.reverse()

                # 一方が横、もう一方が縦の場合は両方反転（問答無用）
                else:
                    e1.reverse()
                    e2.reverse()

    # プレイヤとブロックの衝突判定
    player_rect = pygame.Rect(player_pos[0], player_pos[1], object_size, object_size)
    for block_pos in block_positions:
        block_rect = pygame.Rect(block_pos[0], block_pos[1], object_size, object_size)
        if player_rect.colliderect(block_rect):
            player_pos = old_player_pos.copy()
            break

    # 衝突判定：鍵
    player_rect = pygame.Rect(player_pos[0], player_pos[1], object_size, object_size)
    key_rect = pygame.Rect(key_pos[0] + object_size/6, key_pos[1], 2*object_size/3, object_size)
    if player_rect.colliderect(key_rect):
        key_collected = True

    # 衝突判定：ゴール
    goal_rect = pygame.Rect(goal_pos[0], goal_pos[1], object_size, object_size)
    if key_collected and player_rect.colliderect(goal_rect):
        text = font.render("STAGE CLEAR!", True, RED)
        text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
        notGoal = False

    # 衝突判定：敵
    if notGoal:
        for enemy in enemies:  # enemiesはEnemyインスタンスのリスト
            if player_rect.colliderect(enemy.rect):
                player_image = player_image_failure
                text = font.render("GAME OVER", True, RED)
                text_rect = text.get_rect(center=(WIDTH//2, HEIGHT//2))
                notGameOver = False
                break  # 衝突したらそれ以上調べない

    # 描画
    screen.fill(BLACK)

    # 壁ブロックを描画
    for wall in wall_blocks:
        screen.blit(wall_image, wall)

    # ブロックを描画
    for pos in block_positions:
        screen.blit(block_image, pos)

    if notGoal:
        if not key_collected:
            screen.blit(key_image, (key_pos[0], key_pos[1]))  # 鍵
        # 鍵アイコンを描画
        else:        
            # プレイヤー座標＋オフセット位置に鍵アイコンを描画
            screen.blit(key_icon, (player_pos[0] + offset_x, player_pos[1] + offset_y))

    screen.blit(goal_image, (goal_pos[0], goal_pos[1]))  # ゴール
    for enemy in enemies:
        enemy.draw(screen)
    screen.blit(player_image, (player_pos[0], player_pos[1]))  # プレイヤー

    if not notGameOver or not notGoal:
        screen.blit(text, text_rect)

    pygame.display.update()

    if not notGameOver or not notGoal:
        pygame.time.wait(2000)
        key_collected = False

    old_player_pos = player_pos.copy()
