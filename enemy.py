import pygame
from const import OBJECT_SIZE, WIDTH, HEIGHT
from util import resource_path

class Enemy:
    def __init__(self, x, y, direction, speed, vertical=False):
        self.rect = pygame.Rect(x, y, OBJECT_SIZE, OBJECT_SIZE)
        self.speed = speed
        self.direction = direction
        self.vertical = vertical
        self.prev_pos = self.rect.topleft

        # 画像読み込み
        enemy_img_left_path = resource_path("img/enemy_look_left.png")
        self.image_left = pygame.image.load(enemy_img_left_path).convert_alpha()
        self.image_left = pygame.transform.scale(self.image_left, (OBJECT_SIZE, OBJECT_SIZE))
        self.image_right = pygame.transform.flip(self.image_left, True, False)

        enemy_img_up_path = resource_path("img/enemy_look_up.png")
        self.image_up = pygame.image.load(enemy_img_up_path).convert_alpha()
        self.image_up = pygame.transform.scale(self.image_up, (OBJECT_SIZE, OBJECT_SIZE))

        enemy_img_down_path = resource_path("img/enemy_look_down.png")
        self.image_down = pygame.image.load(enemy_img_down_path).convert_alpha()
        self.image_down = pygame.transform.scale(self.image_down, (OBJECT_SIZE, OBJECT_SIZE))

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

def generate_enemies():
    return [
    Enemy(1200, 600, direction=1, speed=2, vertical=True),
    Enemy(1200, 720, direction=-1, speed=10, vertical=True),
    Enemy(1200, 480, direction=-1, speed=3, vertical=True),
    Enemy(1200, 240, direction=1, speed=4, vertical=True),
]