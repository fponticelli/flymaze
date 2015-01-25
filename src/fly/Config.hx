package fly;

import thx.math.random.Random;
import thx.math.random.PseudoRandom;

using thx.color.RGB;

class Config {
  static public var width  : Int = 660;
  static public var height : Int = 440;
  static var columns = [0, 3, 6, 6, 9, 9, 9, 9, 12, 12, 12, 12, 12, 12, 15, 15, 15, 15, 15, 15, 15, 18];

  public var cols : Int;
  public var rows : Int;
  public var startCol : Int;
  public var startRow : Int;
  public var flies : Int;
  public var flowers : Int;
  public var timePerLevel : Int;
  public var backgroundColor : RGB;
  public var gen : Random;
  public var cellSize : Float;
  public var flyCircleRadius : Float;

  var pseudoRandom : PseudoRandom;

  public function new(level : Int) {
    if(level >= columns.length)
      cols = columns[columns.length - 1];
    else
      cols = columns[level];
    cellSize = Math.floor(width / cols);
    rows = Math.floor(height / cellSize);
    startCol = 0; //Std.int(cols / 2);
    startRow = rows - 1; // Std.int(rows / 4 * 3);
    backgroundColor = 0xBADA88;
    flyCircleRadius = 60;
    flies = 200;
    flowers = 1500;
    timePerLevel = 120;
    gen = new PseudoRandom(level * 2);
  }
}