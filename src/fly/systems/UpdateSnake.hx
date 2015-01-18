package fly.systems;

import edge.*;
import fly.components.*;

class UpdateSnake implements ISystem {
  var world : World;
  public function new(world : World) {
    this.world = world;
  }

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
        world.addEntity(new Entity([
          new Position(tx, ty),
          new Droplet()
        ]));
        snake.jumping.pop();
      }
      i--;
    }
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Snake];

  public function toString() return "UpdateSnake";
}