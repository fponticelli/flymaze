package fly.systems;

import edge.*;
import fly.components.*;
import thx.math.random.Random;

class SnakeEats implements ISystem {
  var engine : Engine;
  var sqdistance : Float;
  var targets : View<{ position : Position, edible : Edible }>;
  var gameInfo : GameInfo;
  public function new(gameInfo : GameInfo, distance : Float) {
    this.sqdistance = distance * distance;
    this.gameInfo = gameInfo;
  }

  function update(position : Position, snake : Snake) {
    var dx, dy, o;
    for(item in targets) {
      o = item.data;
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        item.entity.destroy();
        if(o.edible.makeJump)
          snake.jumping.push(0);
        if(o.edible.makeDroplet)
          engine.create([
            new Position(position.x, position.y),
            new DelayedComponents(
              35,
              [Droplet.create()],
              [DelayedComponents]
            )
          ]);
          engine.create([
            new DelayedComponents(
              35,
              [Audio.poop],
              []
            )
          ]);
        gameInfo.score += o.edible.score;
        if(o.edible.countToPassLevel) {
          gameInfo.toPassLevel--;
          engine.create([Audio.eatFly]);
        } else {
          engine.create([Audio.eatFlower]);
        }
      }
    }
  }
}