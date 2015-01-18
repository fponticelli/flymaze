package fly.components;

import fly.components.Position;

class Trail {
  public var pos : Int;
  public var trail : Array<Position>;
  public var widtha : Float;
  public var widthb : Float;
  public var colors : Array<String>;
  public function new(length : Int, start : Position, widtha : Float = 1, widthb : Float = 4) {
    pos = length - 1;
    trail = [for(i in 0...length) new Position(start.x, start.y)];
    this.widtha = widtha;
    this.widthb = widthb;
    this.colors = ["#ffffff", "#000000"];
  }

  public function map(callback : Position -> Position -> Void) {
    for(i in pos+1...trail.length) {
      callback(trail[i-1], trail[i]);
    }

    for(i in 0...pos) {
      var p = i - 1;
      if(p < 0)
        p = trail.length - 1;
      callback(trail[p], trail[i]);
    }
  }
}