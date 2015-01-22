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
  var world : World;
  var engine : Engine;
  var config : Config;
  var maze : Maze;

  public var running(default, null) : Bool = false;

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
    engine = world.engine;
    var snake = new Snake(60, p),
        snakeEntity = new Entity([
          p,
          direction,
          velocity,
          snake,
          maze,
          new PreviousPosition(p.x, p.y),
          new Score()//,
          //new Fly(10)
        ]);

    //Timer.repeat(function() direction.angle += Math.PI / 180, 10);

    engine.addEntity(snakeEntity);

//    for(i in 0...2)
//      createSnake(world, maze, config.width, config.height);

    for(i in 0...200)
      createFly(engine, config);

    var steering = ONE_DEGREE * 5;

    world.frame.add(new KeyboardInput(function(e) for(key in e.keys) switch key {
      case 37, 65: // left
        direction.angle -= steering;
      case 39, 68: // right
        direction.angle += steering;
      case 38, 87: // accellerate
        velocity.value = (velocity.value + 0.01).min(20);
      case 40, 83: // decellerate
        velocity.value = (velocity.value - 0.01).max(0.02);
      case _: trace('key: $key');
    }));

    world.physics.add(new UpdatePosition());
    world.physics.add(new UpdateFly(config.width, config.height, config.gen));
    world.physics.add(new MazeCollision(config.cellSize));
    world.physics.add(new UpdatePreviousPosition());
    world.physics.add(new UpdateSnake(engine, config.gen));
    world.physics.add(new SnakeEatsFly(engine, 8));

    world.render.add(new RenderBackground(mini, config.backgroundColor));
    world.render.add(new RenderDroplet(mini));
    world.render.add(new RenderSnake(mini));
    world.render.add(new RenderMaze(mini.ctx, config.cellSize));
    world.render.add(new RenderFly(mini));
    world.render.add(new RenderScore(mini));

    // general systems

    js.Browser.window.addEventListener("keyup", function(e) {
      if(e.keyCode == 32) {
        if(running)
          stop();
        else {
          run();
        }
      }
    });

    //world.render.add(new RenderPosition(mini), Cycle.render);
  }
/*
  function createSnake(world : World, maze : Maze, w, h) {
    var p = new Position(Math.random() * w, Math.random() * h);
    var snake = new Entity([
      p,
      new Direction(Math.random() * 2 * Math.PI),
      new Velocity(2),
      new Snake(40, p),
      maze,
      new PreviousPosition(p.x, p.y)
    ]);
    engine.addEntity(snake);
  }
*/
  function createFly(engine : Engine, config : Config) {
    var a = config.gen.float() * Math.PI * 2,
        p = new Position(
          Math.cos(a) * config.gen.float() * config.flyCircleRadius + config.width / 2,
          Math.sin(a) * config.gen.float() * config.flyCircleRadius + config.height / 2);
    engine.addEntity(new Entity([p, Fly.create(config.gen)]));
  }

  public function run()
    world.start();

  public function stop()
    world.stop();
}