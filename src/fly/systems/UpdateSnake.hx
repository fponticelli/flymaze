package fly.systems;

import edge.*;
import fly.components.*;

class UpdateSnake implements ISystem {
  public function update(position : Position, snake : Snake) {
    var last = snake.pos + 1;
    if(last >= snake.trail.length)
      last = 0;
    var tx = snake.trail[last].x,
        ty = snake.trail[last].y;
    snake.trail[snake.pos].x = position.x;
    snake.trail[snake.pos].y = position.y;
    snake.pos++;
    if(snake.pos >= snake.trail.length)
      snake.pos = 0;

    var i = snake.jumping.length - 1;
    while(i >= 0 ) {
      snake.jumping[i]++;
      if(snake.jumping[i] == snake.trail.length) {
        snake.jumping.pop();
      }
      i--;
    }
  }
}