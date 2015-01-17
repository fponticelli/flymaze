package fly;

import fly.systems.UpdatePosition;
import thx.core.Functions;
import thx.core.Timer;

import edge.*;
import edge.World;
import fly.components.*;
import fly.systems.*;

class Game {
  var fly : Entity;
  var world : World;
  var remainder = 0.0;
  var delta = 20.0;
  var cancel : Void -> Void;

  public function new() {
    world = new World();

    fly = new Entity();
    fly.addComponents([
      new Position(100, 100),
      new Direction(-Math.PI / 2),
      new Velocity(4)
    ]);

    world.addEntity(fly);

    world.addSystem(new UpdatePosition(), Cycle.update);
  }

  public function run() {
    cancel = Timer.frame(function(t) {
      t += remainder;
      while(t > delta) {
        t -= delta;
        world.update();
      }
      remainder = t;
      world.render();
    });
  }

  public function stop() {
    cancel();
    cancel = Functions.noop;
  }
}