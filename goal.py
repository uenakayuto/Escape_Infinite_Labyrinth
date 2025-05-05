from const import OBJECT_SIZE
from util import load_scaled_image

# ゴール画像の読み込み
def load_goal_image():
    return load_scaled_image("img/goal.png", OBJECT_SIZE)