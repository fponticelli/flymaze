package fly.systems;

import edge.ISystem;
import fly.components.Position;
import fly.components.Snake;

class UpdateSnake implements ISystem {
  public function new() {}

  public function update(position : Position, snake : Snake) {
    snake.trail[snake.pos].x = position.x;
    snake.trail[snake.pos].y = position.y;
    snake.pos++;
    if(snake.pos >= snake.trail.length)
      snake.pos = 0;
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Snake];

  public function toString() return "UpdateSnake";
}