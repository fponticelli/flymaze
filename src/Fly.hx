import amaze.Maze;

using thx.core.Floats;

class Fly {
  public var x(default, null) : Float;
  public var y(default, null) : Float;
  public var v(default, null) : Float;
  public var d(default, null) : Float;
  public var radius(default, null) : Float;
  public var maxSteering = 10;
  public var trail(default, null) : Array<{ x : Float, y : Float }>;
  public var trailPos(default, null) : Int;
  public var row(default, null) : Int;
  public var col(default, null) : Int;

  var _steer : Int;
  var maze : Maze;
  var size : Float;

  public function new(x, y, maze : Maze, size : Float) {
    this.radius = 4;
    this.x = x;
    this.y = y;
    this.maze = maze;
    this.size = size;
    this.row = Std.int(y / size);
    this.col = Std.int(x / size);
    v = 4;
    d = -Math.PI / 2;
    trail = [for(i in 0...35) { x : x, y : y }];
    trailPos = 0;
  }

  public function update() {
    d = Floats.wrapCircular(d + maxSteering * _steer / 180 * Math.PI, Math.PI * 2);
    var dx = Math.cos(d) * v,
        dy = Math.sin(d) * v;
    trail[trailPos].x = x;
    trail[trailPos].y = y;
    // check is crossing
    var cell = maze.cells[row][col];
    if(x + dx <= col * size && !cell.left) {
      // crossing left
      dx = col * size - (x + dx);
      d = -d + Math.PI + error(0.2);
      //trail.pop();
    } else if(x + dx >= (col + 1) * size && !cell.right) {
      // crossing right
      dx = (col + 1) * size - (x + dx);
      d = -d + Math.PI + error(0.2);
      //trail.pop();
    }
    if(y + dy <= row * size && !cell.top) {
      // crossing top
      dy = row * size - (y + dy);
      d = -d + error(0.2);
      //trail.pop();
    } else if(y + dy >= (row + 1) * size && !cell.bottom) {
      // crossing bottom
      dy = (row + 1) * size - (y + dy);
      d = -d + error(0.2);
      //trail.pop();
    }

    if(++trailPos >= trail.length)
      trailPos = 0;

    // if there is a wall, bounce
    x += dx;
    y += dy;

    row = Std.int(y / size);
    col = Std.int(x / size);
    _steer = 0;
  }

  function error(max : Float)
    return Math.random() * max * 2 - max;

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