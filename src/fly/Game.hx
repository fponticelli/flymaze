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
          new Score(0)
        ]);

    engine.addEntity(snakeEntity);

    for(i in 0...200)
      createFly(engine, config);

    for(i in 0...3500)
      createFlower(engine, config);

    var steering = ONE_DEGREE * 5;

    world.frame.add(new KeyboardInput(function(e) for(key in e.keys) switch key {
      case 37, 65: // left
        direction.angle -= steering;
      case 39, 68: // right
        direction.angle += steering;
      case 38, 87: // accellerate
        velocity.value = (velocity.value + 0.01).min(10);
      case 40, 83: // decellerate
        velocity.value = (velocity.value - 0.01).max(0.02);
      case _: trace('key: $key');
    }));

    world.physics.add(new MazeCollision(config.cellSize));
    world.physics.add(new UpdatePosition());
    world.physics.add(new UpdateFly(config.width, config.height, config.gen));
    world.physics.add(new UpdateSnake());
    world.physics.add(new SnakeEats(engine, config.gen, 8));

    world.render.add(new RenderBackground(mini, config.backgroundColor));
    world.render.add(new RenderDroplet(mini));
    world.render.add(new RenderMaze(mini.ctx, config.cellSize));
    world.render.add(new RenderFlower(mini, 200, 18));
    world.render.add(new RenderSnake(mini));
    world.render.add(new RenderFly(mini));
    world.render.add(new RenderScore(mini));

    js.Browser.window.addEventListener("keyup", function(e) {
      if(e.keyCode == 32) {
        if(world.running)
          stop();
        else {
          start();
        }
      }
    });
  }

  static var edibleFly = new Edible(true, true);
  static var edibleFlower = new Edible(false, false);

  function createFly(engine : Engine, config : Config) {
    var a = config.gen.float() * Math.PI * 2,
        p = new Position(
          Math.cos(a) * config.gen.float() * config.flyCircleRadius + config.width / 2,
          Math.sin(a) * config.gen.float() * config.flyCircleRadius + config.height / 2);
    engine.addEntity(new Entity([p, Fly.create(config.gen), edibleFly]));
  }

  function createFlower(engine : Engine, config : Config) {
    var p = new Position(
          config.width * config.gen.float(),
          config.height * config.gen.float()
        );
    engine.addEntity(new Entity([p, new Flower(config.gen.int()), edibleFlower]));
  }

  public function start()
    world.start();

  public function stop()
    world.stop();
}