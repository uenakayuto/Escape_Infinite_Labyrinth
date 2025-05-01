import pygame
from const import OBJECT_SIZE, PLAYER_SPEED, WIDTH, HEIGHT
from util import resource_path

class Player:
    def __init__(self, x, y, speed=PLAYER_SPEED):
        self.rect = pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE)
        self.speed = speed
        self.failed = False
        
        # 画像読み込み
        self.image_left = self.load_and_scale("img/player_look_left.png")
        self.image_right = pygame.transform.flip(self.image_left, True, False)
        self.image_up = self.load_and_scale("img/player_look_up.png")
        self.image_down = self.load_and_scale("img/player_look_down.png")
        self.image_failure = self.load_and_scale("img/player_failure.png")
        
        # 初期向き: 画面の中心に対して決定（例：画面右半分なら左向き）
        if self.rect.x > WIDTH / 2:
            self.image = self.image_left
        else:
            self.image = self.image_right
        
        # 移動前の位置の記録用（衝突などで元に戻すため）
        self.prev_pos = self.rect.topleft

    def load_and_scale(self, image_path):
        """画像を読み込み、OBJECT_SIZEでリサイズする"""
        full_path = resource_path(image_path)
        image = pygame.image.load(full_path).convert_alpha()
        return pygame.transform.scale(image, (OBJECT_SIZE, OBJECT_SIZE))
    
    def handle_input(self, keys, block_positions):
        self.prev_pos = self.rect.topleft  # 現在位置を記録

        # 入力に応じて位置を更新
        if keys[pygame.K_LEFT]:
            self.rect.x -= self.speed
            self.image = self.image_left
        if keys[pygame.K_RIGHT]:
            self.rect.x += self.speed
            self.image = self.image_right
        if keys[pygame.K_UP]:
            self.rect.y -= self.speed
            self.image = self.image_up
        if keys[pygame.K_DOWN]:
            self.rect.y += self.speed
            self.image = self.image_down

        # 画面外に出ないように制御
        if self.rect.left < OBJECT_SIZE or self.rect.right > WIDTH - OBJECT_SIZE or \
        self.rect.top < OBJECT_SIZE or self.rect.bottom > HEIGHT - OBJECT_SIZE:
            self.rect.topleft = self.prev_pos

        # ブロックとの衝突判定
        for block_pos in block_positions:
            block_rect = pygame.Rect(block_pos[0], block_pos[1], OBJECT_SIZE, OBJECT_SIZE)
            if self.rect.colliderect(block_rect):
                self.rect.topleft = self.prev_pos
                break
        
    def draw(self, screen):
            if self.failed:
                screen.blit(self.image_failure, self.rect.topleft)
            else:
                screen.blit(self.image, self.rect.topleft)
        
    def set_failure(self):
            self.failed = True

def generate_player():
    """プレイヤーの初期位置を生成"""
    return Player(60, 60)