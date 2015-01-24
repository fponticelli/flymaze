package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderScore implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  function update(score : Score) {
    mini.ctx.font = "16px 'Montserrat', sans-serif";
    mini.ctx.lineWidth = 4;
    mini.ctx.strokeStyle = "#FFFFFF";
    mini.ctx.strokeText('${score.value}', 10, 20);
    mini.ctx.fillStyle = "#000000";
    mini.ctx.fillText('${score.value}', 10, 20);
  }
}