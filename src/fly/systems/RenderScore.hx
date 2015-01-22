package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderScore implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(score : Score) {
    mini.ctx.font = "16px 'Montserrat', sans-serif";
    mini.ctx.fillStyle = "#000000";
    mini.ctx.fillText('${score.value}', 10, 20);
  }
}