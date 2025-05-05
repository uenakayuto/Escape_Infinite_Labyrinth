import pygame
from const import OBJECT_SIZE
from util import resource_path

# ゴール画像の読み込み
def load_goal_image():
    goal_img_path = resource_path("img/goal.png")
    goal_image = pygame.image.load(goal_img_path).convert_alpha()
    goal_image = pygame.transform.scale(goal_image, (OBJECT_SIZE, OBJECT_SIZE))
    
    return goal_image