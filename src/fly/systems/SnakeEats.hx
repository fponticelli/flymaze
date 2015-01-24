package fly.systems;

import edge.*;
import fly.components.*;
import thx.math.random.Random;

class SnakeEats implements ISystem {
  public var engine : Engine;
  var sqdistance : Float;
  var gen : Random;
  public var entities : Iterator<{ position : Position, edible : Edible, entity : Entity }>;
  public function new(gen : Random, distance : Float) {
    this.gen = gen;
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
        if(o.edible.makeDroplet)
          engine.addEntity(new Entity([
            new Position(position.x, position.y),
            Droplet.create(gen)
          ]));
        score.value += o.edible.score;
      }
    }
  }
}