def handle_enemy_collisions(enemies):
    for i in range(len(enemies)):
        for j in range(i + 1, len(enemies)):
            e1 = enemies[i]
            e2 = enemies[j]

            if e1.rect.colliderect(e2.rect):
                # 縦移動同士
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
                            e1.reverse()
                            e2.reverse()
                # 横移動同士
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
                # 一方が縦、一方が横
                else:
                    e1.reverse()
                    e2.reverse()