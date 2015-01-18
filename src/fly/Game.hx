package fly;

import fly.systems.*;
import amaze.Maze;
import thx.core.Functions;
import thx.core.Timer;
using thx.core.Floats;

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
    var p = new Position(
          (config.startCol + 0.5) * config.cellSize,
          (config.startRow + 1) * config.cellSize - 2),
        direction = new Direction(-Math.PI / 2 + 3 * ONE_DEGREE),
        velocity = new Velocity(2);

    maze = new Maze(config.cols, config.rows, config.gen);
    maze.generate(config.startRow, config.startCol);
    maze.cells[config.startRow][config.startCol].top = true;
    maze.cells[config.startRow-1][config.startCol].bottom = true;

    world = new World();
    snake = new Entity([
      p,
      direction,
      velocity,
      new Trail(40, p),
      maze,
      new PreviousPosition(p.x, p.y)
    ]);

    //Timer.repeat(function() direction.angle += Math.PI / 180, 10);

    world.addEntity(snake);

//    for(i in 0...2)
//      createSnake(world, maze, config.width, config.height);

    world.addSystem(new UpdatePosition(), Cycle.preUpdate);
    world.addSystem(new MazeCollision(config.cellSize), Cycle.update);
    world.addSystem(new UpdatePreviousPosition(), Cycle.postUpdate);
    world.addSystem(new UpdateTrail(), Cycle.postUpdate);

    world.addSystem(new RenderSnake(mini), Cycle.render);
    world.addSystem(new RenderMaze(mini.ctx, config.cellSize), Cycle.postRender);

    // general systems
    world.addSystem(new RenderBackground(mini, config.backgroundColor), Cycle.preRender);
    world.addSystem(new KeyboardInput(function(keys) for(key in keys) switch key {
      case 37, 65: // left
        direction.angle -= ONE_DEGREE * 3;
      case 39, 68: // right
        direction.angle += ONE_DEGREE * 3;
      case 38, 87: // accellerate
        velocity.value = (velocity.value + 0.01).min(4);
      case 40, 83: // decellerate
        velocity.value = (velocity.value - 0.01).max(0);
      case _: trace('key: $key');
    }), Cycle.preFrame);

    //world.addSystem(new RenderPosition(mini), Cycle.render);
  }

  function createSnake(world, maze,w, h) {
    var p = new Position(Math.random() * w, Math.random() * h);
    var snake = new Entity([
      p,
      new Direction(Math.random() * 2 * Math.PI),
      new Velocity(2),
      new Trail(40, p),
      maze,
      new PreviousPosition(p.x, p.y)
    ]);
    world.addEntity(snake);
  }

  public function run() {
    cancel = Timer.frame(frame);
  }

  function frame(t : Float) {
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
  }

  public function stop() {
    cancel();
    cancel = Functions.noop;
  }
}