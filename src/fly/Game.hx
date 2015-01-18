package fly;

import fly.systems.*;
import minicanvas.MiniCanvas;
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
  var config : Config;

  public function new(mini : MiniCanvas, config : Config) {
    world = new World();

    fly = new Entity();
    fly.addComponents([
      new Position(100, 100),
      new Direction(-Math.PI / 2),
      new Velocity(4)
    ]);

    world.addEntity(fly);

    world.addEntity(new Entity([new StageBackground(config.backgroundColor)]));

    world.addSystem(new UpdatePosition(), Cycle.update);
    world.addSystem(new RenderBackground(mini), Cycle.preRender);
  }

  public function run() {
    cancel = Timer.frame(function(t) {
      t += remainder;
      while(t > delta) {
        t -= delta;
        world.update();
      }
      remainder = t;
      world.preRender();
      world.render();
    });
  }

  public function stop() {
    cancel();
    cancel = Functions.noop;
  }
}