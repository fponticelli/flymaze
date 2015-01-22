package fly.systems;

import edge.*;
import fly.components.*;
import thx.math.random.Random;

class UpdateSnake implements ISystem {
  var engine : Engine;
  var gen : Random;
  public function new(engine : Engine, gen : Random) {
    this.engine = engine;
    this.gen = gen;
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
        engine.addEntity(new Entity([
          new Position(tx, ty),
          Droplet.create(gen)
        ]));
        snake.jumping.pop();
      }
      i--;
    }
  }

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [Position, Snake];
  public var entityRequirements(default, null) = null;

  public function toString() return "UpdateSnake";
}