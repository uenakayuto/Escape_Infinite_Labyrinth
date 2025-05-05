import pygame
from const import OBJECT_SIZE, WIDTH, HEIGHT
from util import load_scaled_image

class Enemy:
    def __init__(self, x, y, direction, speed, vertical=False):
        self.rect = pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE)
        self.speed = speed
        self.direction = direction
        self.vertical = vertical
        self.prev_pos = self.rect.topleft

        # 画像読み込み
        self.image_left = load_scaled_image("img/enemy_look_left.png", OBJECT_SIZE)
        self.image_right = pygame.transform.flip(self.image_left, True, False)

        self.image_up = load_scaled_image("img/enemy_look_up.png", OBJECT_SIZE)

        self.image_down = load_scaled_image("img/enemy_look_down.png", OBJECT_SIZE)

        self.image = self.get_image()

    def get_image(self):
        if self.vertical:
            return self.image_down if self.direction == 1 else self.image_up
        else:
            return self.image_right if self.direction == 1 else self.image_left

    def move(self, blocks):
        self.prev_pos = self.rect.topleft
        if self.vertical:
            self.rect.y += self.speed * self.direction
        else:
            self.rect.x += self.speed * self.direction

        # 壁との衝突チェック
        for block in blocks:
            if self.rect.colliderect(block):
                self.reverse()
                break

        # 画面端との衝突チェック
        if self.rect.left < OBJECT_SIZE or self.rect.right > WIDTH - OBJECT_SIZE or \
           self.rect.top < OBJECT_SIZE or self.rect.bottom > HEIGHT - OBJECT_SIZE:
            self.reverse()

    def draw(self, screen):
        screen.blit(self.image, self.rect.topleft)

    def reverse(self):
        self.direction *= -1
        self.rect.topleft = self.prev_pos
        self.image = self.get_image()

# 敵画像をHow_to_Play用に読み込み
def load_enemy_image():
    return load_scaled_image("img/enemy_look_left.png", OBJECT_SIZE)
