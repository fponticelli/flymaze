package fly;

import fly.systems.*;
import amaze.Maze;
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
  var maze : Maze;

  static var ONE_DEGREE = Math.PI / 180;

  public function new(mini : MiniCanvas, config : Config) {
    var p = new Position(config.width / 2, config.height / 2),
        direction = new Direction(-Math.PI / 2);

    maze = new Maze(config.cols, config.rows, config.gen);
    maze.generate(0, 0);
    world = new World();
    snake = new Entity([
      p,
      direction,
      new Velocity(2),
      new Trail(40, p),
      maze
    ]);

    //Timer.repeat(function() direction.angle += Math.PI / 180, 10);

    world.addEntity(snake);

    world.addSystem(new UpdatePosition(), Cycle.update);
    world.addSystem(new UpdateTrail(), Cycle.update);
    world.addSystem(new RenderSnake(mini), Cycle.render);
    world.addSystem(new RenderMaze(mini.ctx, config.cellSize), Cycle.postRender);

    // general systems
    world.addSystem(new RenderBackground(mini, config.backgroundColor), Cycle.preRender);
    world.addSystem(new KeyboardInput(function(keys) for(key in keys) switch key {
      case 37, 65: // left
        direction.angle -= ONE_DEGREE * 3;
      case 39, 68: // right
        direction.angle += ONE_DEGREE * 3;
      case _: trace('key: $key');
    }), Cycle.preFrame);

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