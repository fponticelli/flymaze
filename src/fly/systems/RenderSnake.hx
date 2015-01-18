package fly.systems;

import edge.*;

import fly.components.Position;
import fly.components.Trail;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderSnake implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(position : Position, trail : Trail) {
    var pos = 0;
    trail.map(function(a, b) {
      var s = (pos / trail.trail.length).interpolate(trail.widtha, trail.widthb);
      mini.line(a.x, a.y, b.x, b.y, s, trail.colors[pos % trail.colors.length]);
      pos++;
    });
    mini.dot(position.x, position.y, trail.widthb, trail.colors[pos % trail.colors.length]);
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Trail];

  public function toString() return "RenderSnake";
}