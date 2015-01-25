package fly;

import thx.math.random.Random;
import thx.math.random.PseudoRandom;

using thx.color.RGB;

class Config {
  public var width : Int;
  public var height : Int;
  public var cols : Int;
  public var rows : Int;
  public var startCol : Int;
  public var startRow : Int;
  public var backgroundColor : RGB;
  public var gen : Random;
  public var cellSize : Float;
  public var flyCircleRadius : Float;
  public var seed : Int;

  var pseudoRandom : PseudoRandom;

  public function new() {
    width  = 642;
    height = 514;
    cols = 10;
    cellSize = Std.int(width / cols);
    rows = Std.int(height / cellSize);
    startCol = 0; //Std.int(cols / 2);
    startRow = rows - 1; // Std.int(rows / 4 * 3);
    backgroundColor = 0xBADA88;
    flyCircleRadius = 60;
    seed = 6;
    gen = pseudoRandom = new PseudoRandom(seed);
  }

  public function resetSeed() {
    pseudoRandom.seed = seed;
  }
}