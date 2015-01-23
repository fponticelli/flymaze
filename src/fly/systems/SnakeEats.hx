package fly.systems;

import edge.*;
import fly.components.*;

class SnakeEats implements ISystem {
  var engine : Engine;
  var sqdistance : Float;
  public var entities : Iterator<{ position : Position, edible : Edible, entity : Entity }>;
  public function new(engine : Engine, distance : Float) {
    this.engine = engine;
    this.sqdistance = distance * distance;
  }

  public function update(position : Position, snake : Snake, score : Score) {
    var dx, dy;
    for(o in entities) {
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        engine.removeEntity(o.entity);
        if(o.edible.makeJump)
          snake.jumping.push(0);
        score.value++;
      }
    }
  }
}