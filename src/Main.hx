import amaze.Cell;
import amaze.Maze;
import fly.Config;
import js.html.CanvasRenderingContext2D;
using thx.core.Floats;
import thx.core.Timer;
import thx.math.random.PseudoRandom;
import sui.Sui;

import fly.Game;

class Main {
  static var startColumn = 8;
  static var startRow = 8;
  static var cellSize = 40;
  static var fly : Fly;
  static var delta = 50;

  public static function main() {
    var config = new Config(),
        mini = MiniCanvas.create(config.width, config.height).display("flymaze"),
        game = new fly.Game(mini, config);
    game.run();
    Timer.delay(game.stop, 40000);
/*
    var sui = new Sui();
    sui.bind(maze.width);
    sui.bind(maze.height);
    sui.bind(cellSize);
    sui.attach();
    //sui.bind(function() maze.generate.bind(rows - 1, Math.floor(cols / 2)));
*/
  }
}