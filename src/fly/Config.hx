package fly;

import thx.math.random.Random;
import thx.math.random.NativeRandom;

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

  public function new() {
    width  = 642;
    height = 514;
    cols = 10;
    cellSize = Std.int(width / cols);
    rows = Std.int(height / cellSize);
    startCol = Std.int(cols / 2);
    startRow = Std.int(rows / 4 * 3);
    backgroundColor = 0xBADA88;
    gen = new NativeRandom();
  }
}