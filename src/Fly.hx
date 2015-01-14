class Fly {
  public var x : Float;
  public var y : Float;
  public var v : Float;
  public var d : Float;
  public var maxSteering = 30.0;

  var _steer : Int;

  public function new() {
    x = 0.0;
    y = 0.0;
    v = 1.0;
    d = -Math.PI / 2;
  }

  public function update() {
    d += maxSteering * _steer / 180 * Math.PI;
    var dx = Math.cos(d) * v,
        dy = Math.sin(d) * v;
    x += dx;
    y += dy;
    _steer = 0;
  }

  public function left() {
    _steer--;
  }

  public function right() {
    _steer++;
  }
}