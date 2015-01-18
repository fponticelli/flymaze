package fly;

using thx.color.RGB;

class Config {
  public var width : Int;
  public var height : Int;
  public var backgroundColor : RGB;

  public function new(width : Int, height : Int, backgroundColor : RGB) {
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }
}