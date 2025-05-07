import pygame
from const import OBJECT_SIZE, PLAYER_SPEED, WIDTH, HEIGHT
from util import load_scaled_image

class Player:
    def __init__(self, x, y, speed=PLAYER_SPEED):
        self.rect = pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE)
        self.speed = speed
        self.failed = False
        
        # 画像読み込み
        self.image_left = load_scaled_image("img/player_look_left.png", OBJECT_SIZE)
        self.image_right = pygame.transform.flip(self.image_left, True, False)
        self.image_up = load_scaled_image("img/player_look_up.png", OBJECT_SIZE)
        self.image_down = load_scaled_image("img/player_look_down.png", OBJECT_SIZE)
        self.image_failure = load_scaled_image("img/player_failure.png", OBJECT_SIZE)
        
        # 初期向き: 画面の中心に対して決定
        if self.rect.x > WIDTH / 2:
            self.image = self.image_left
        else:
            self.image = self.image_right
        
        # 移動前の位置の記録用（衝突などで元に戻すため）
        self.prev_pos = self.rect.topleft
    
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

# How to Play用のプレイヤー画像を読み込み
def load_player_image():
    return load_scaled_image("img/player_look_left.png", OBJECT_SIZE)