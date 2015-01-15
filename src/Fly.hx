class Fly {
  public var x(default, null) : Float;
  public var y(default, null) : Float;
  public var v(default, null) : Float;
  public var d(default, null) : Float;
  public var radius(default, null) : Float;
  public var maxSteering = 10;
  public var trail(default, null) : Array<{ x : Float, y : Float }>;
  public var trailPos(default, null) : Int;

  var _steer : Int;

  public function new(x, y) {
    this.radius = 4;
    this.x = x;
    this.y = y;
    v = 3;
    d = -Math.PI / 2;
    trail = [for(i in 0...35) { x : x, y : y }];
    trailPos = 0;
  }

  public function update() {
    d += maxSteering * _steer / 180 * Math.PI;
    var dx = Math.cos(d) * v,
        dy = Math.sin(d) * v;
    trail[trailPos].x = x;
    trail[trailPos].y = y;
    if(++trailPos == trail.length)
      trailPos = 0;
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

  public function accellerate() {
    v += 0.2;
  }

  public function decellerate() {
    v -= 0.2;
  }
}