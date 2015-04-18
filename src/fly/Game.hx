package fly;

import fly.systems.*;
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

  public var running(get, null) : Bool;

  static var ONE_DEGREE = Math.PI / 180;

  public function new(mini : MiniCanvas, config : Config, gameInfo : GameInfo, endLevel : Bool -> Void) {
    var p = new Position(
          (config.startCol + 0.5) * config.cellSize,
          (config.startRow + 1) * config.cellSize - 2),
        direction = new Direction(-Math.PI / 2),
        velocity = new Velocity(4.4),
        m = new amaze.Maze(config.cols, config.rows, config.gen);
    m.generate(config.startRow, config.startCol);
    m.cells[config.startRow][config.startCol].top = true;
    m.cells[config.startRow-1][config.startCol].bottom = true;
    maze = new Maze(m, 1);

    function keyUp(e) {
      if(e.keyCode == 32 || e.keyCode == 80) {
        if(world.running)
          stop();
        else {
          start();
        }
      } else if(e.keyCode == 77) {
        gameInfo.mute = !gameInfo.mute;
      }
    }

    world = new World(30);
    engine = world.engine;
    var snake = new Snake(40, p),
        snakeEntity = engine.create([
          p,
          direction,
          velocity,
          snake,
          maze
        ]);

    for(i in 0...config.flies)
      createFly(engine, config);

    for(i in 0...config.flowers)
      createFlower(engine, config);

    var steering = ONE_DEGREE * 10;

    // TODO, consider adding a phase specific for input?
    world.physics.add(new KeyboardInput(function(e) for(key in e.keys) switch key {
      case 37, 65: // left
        direction.angle -= steering;
      case 39, 68: // right
        direction.angle += steering;
//      case 38, 87: // accellerate
//        velocity.value = (velocity.value + 0.01).min(10);
//      case 40, 83: // decellerate
//        velocity.value = (velocity.value - 0.01).max(0.02);
//      case _: trace('key: $key');
    }));


    engine.create([new CountDown(3)]);
    engine.create([Audio.start]);

    world.physics.add(new UpdateDelayedComponents());
    world.physics.add(new MazeCollision(config.cellSize));
    world.physics.add(new UpdateDroplet());
    world.physics.add(new UpdateExplosion());
    world.physics.add(new UpdateDetonation(gameInfo, 10));
    world.physics.add(new UpdateFly(Config.width, Config.height, config.gen));

    world.physics.add(new UpdateCountDown(function() {
      world.physics.add(new UpdateGameInfo(gameInfo, function(nextLevel) {
        js.Browser.window.removeEventListener("keyup", keyUp);
        world.engine.clear();
        if(nextLevel) {
          PlayAudio.playSound("success");
        } else {
          PlayAudio.playSound("gameover");
        }
        endLevel(nextLevel);
      }));
      world.physics.add(new UpdatePosition());
      world.physics.add(new UpdateSnake());
      world.physics.add(new SnakeEats(gameInfo, 10));

      js.Browser.window.addEventListener("keyup", keyUp);
    }));

    world.render.add(new RenderBackground(mini, config.backgroundColor));
    world.render.add(new RenderDroplet(mini));
    world.render.add(new RenderMaze(mini.ctx, config.cellSize));
    world.render.add(new RenderFlower(mini, 200, 20));
    world.render.add(new RenderSnake(mini));
    world.render.add(new RenderFly(mini));
    world.render.add(new RenderExplosion(mini));
    world.render.add(new RenderCountDown(mini));
    world.render.add(new RenderGameInfo(gameInfo, mini));

    world.render.add(new PlayAudio(gameInfo));
    world.render.add(new BackgroundBuzz());
  }

  static var edibleFly = new Edible(true, true, 50, true);
  static var edibleFlower = new Edible(true, true, 10, false);

  function createFly(engine : Engine, config : Config) {
    var a = config.gen.float() * Math.PI * 2,
        p = new Position(
          config.gen.float() * Config.width, //Math.cos(a) * config.gen.float() * config.flyCircleRadius + config.width / 2,
          config.gen.float() * Config.height //Math.sin(a) * config.gen.float() * config.flyCircleRadius + config.height / 2
        );
    engine.create([p, Fly.create(config.gen), edibleFly]);
  }

  function createFlower(engine : Engine, config : Config) {
    var p = new Position(
          Config.width * config.gen.float(),
          Config.height * config.gen.float()
        );
    engine.create([p, new Flower(config.gen.int()), edibleFlower]);
  }

  function get_running()
    return world.running;

  public function start()
    world.start();

  public function stop()
    world.stop();
}
