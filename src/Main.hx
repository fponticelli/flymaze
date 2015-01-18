import fly.Config;
import sui.Sui;

import fly.Game;

class Main {
  public static function main() {
    var config = new Config(),
        mini = MiniCanvas.create(config.width, config.height).display("flymaze"),
        game = new fly.Game(mini, config);
    game.run();
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