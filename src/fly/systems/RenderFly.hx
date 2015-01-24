package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderFly implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  function update(position : Position, f : Fly) {
    var p = Math.random() * 6 - 3;
    mini.dot(position.x + f.height, position.y + f.height * 2, 2.5, 0x00000044);
    mini.dot(position.x - 4.5 - p / 3, position.y + p, 2, 0xEEFFEEFF);
    mini.dot(position.x + 4.5 + p / 3, position.y + p, 2, 0xEEFFEEFF);
    mini.dot(position.x, position.y, 1.5, 0x000000FF);
  }
}