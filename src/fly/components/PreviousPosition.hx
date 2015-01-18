package fly.components;

class PreviousPosition {
  public function new(x : Float, y : Float) {
    this.x = x;
    this.y = y;
  }

  public var x : Float;
  public var y : Float;

  public function toString()
    return 'PreviousPosition($x, $y)';
}