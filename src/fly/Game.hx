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
  var snake : Entity;
  var world : World;
  var remainder = 0.0;
  var delta = 20.0;
  var cancel : Void -> Void;
  var config : Config;

  public function new(mini : MiniCanvas, config : Config) {
    world = new World();

    snake = new Entity();
    var p = new Position(config.width / 2, config.height / 2),
        d = new Direction(-Math.PI / 2);
    snake.addComponents([
      p,
      d,
      new Velocity(3),
      new Trail(30, p)
    ]);

    Timer.repeat(function() d.angle += Math.PI / 180, 10);

    world.addEntity(snake);

    world.addSystem(new UpdatePosition(), Cycle.update);
    world.addSystem(new UpdateTrail(), Cycle.update);
    world.addSystem(new RenderSnake(mini), Cycle.render);
    world.addSystem(new RenderBackground(mini, config.backgroundColor), Cycle.preRender);
    //world.addSystem(new RenderPosition(mini), Cycle.render);
  }

  public function run() {
    cancel = Timer.frame(function(t) {
      world.preFrame();
      t += remainder;
      while(t > delta) {
        t -= delta;
        world.preUpdate();
        world.update();
        world.postUpdate();
      }
      remainder = t;
      world.preRender();
      world.render();
      world.postRender();
      world.postFrame();
    });
  }

  public function stop() {
    cancel();
    cancel = Functions.noop;
  }
}