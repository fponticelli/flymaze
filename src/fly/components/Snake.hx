package fly.components;

import edge.World;
import fly.components.Position;

class Snake {
  public var pos : Int;
  public var trail : Array<Position>;
  public var trailWidth : Float;
  public var headWidth : Float;
  public var colors : Array<String>;
  public var jumping : Array<Int>;
  public function new(length : Int, start : Position, trailWidth : Float = 1, headWidth : Float = 4) {
    pos = length - 1;
    trail = [for(i in 0...length) new Position(start.x, start.y)];
    this.trailWidth = trailWidth;
    this.headWidth = headWidth;
    this.colors = ["#ffffff", "#dddddd", "#bbbbbb", "#0000ff", "#000055"];
    jumping = [];
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