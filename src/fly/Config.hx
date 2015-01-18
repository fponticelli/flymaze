package fly;

import thx.math.random.Random;
import thx.math.random.NativeRandom;

using thx.color.RGB;

class Config {
  public var width : Int;
  public var height : Int;
  public var cols : Int;
  public var rows : Int;
  public var backgroundColor : RGB;
  public var gen : Random;
  public var cellSize : Float;

  public function new() {
    this.width  = 640;
    this.height = 480;
    this.cols = 16;
    this.rows = 12;
    this.backgroundColor = 0xDADA99;
    this.gen = new NativeRandom();
    this.cellSize = 40;
  }
}