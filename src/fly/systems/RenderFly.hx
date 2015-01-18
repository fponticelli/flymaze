package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderFly implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(position : Position, _ : Fly) {
    var p = Math.random() * 6 - 3;
    mini.dot(position.x-4.5-p/3, position.y + p, 2, 0xCCFFEEEE);
    mini.dot(position.x+4.5+p/3, position.y + p, 2, 0xCCFFEEEE);
    mini.dot(position.x, position.y, 1.5, 0x000000FF);
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Fly];

  public function toString() return "RenderFly";
}