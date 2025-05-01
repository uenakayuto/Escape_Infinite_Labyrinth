import pygame
from const import OBJECT_SIZE
from util import resource_path

# ゴールの初期位置（後で randomizer に置き換え可能）
def generate_goal_position():
    # ここをランダムに後で変更できる
    return [540, 420]

# ゴール画像の読み込み
def load_goal_images():
    goal_img_path = resource_path("img/goal.png")
    goal_image = pygame.image.load(goal_img_path).convert_alpha()
    goal_image = pygame.transform.scale(goal_image, (OBJECT_SIZE, OBJECT_SIZE))
    
    return goal_image