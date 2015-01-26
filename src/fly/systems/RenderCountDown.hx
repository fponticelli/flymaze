package fly.systems;

import fly.components.CountDown;
import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;
using thx.format.NumberFormat;

class RenderCountDown implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas) {
    this.mini = mini;
  }

  function update(countDown : CountDown) {
    mini.ctx.font = "160px 'Montserrat', sans-serif";
    mini.ctx.textAlign = "center";
    mini.ctx.lineWidth = 4;
    mini.ctx.strokeStyle = "#FFFFFF";
    mini.ctx.fillStyle = "#000000";
    var t = '' + Math.ceil(countDown.time);
    mini.ctx.strokeText(t, Config.width / 2, Config.height / 2);
    mini.ctx.fillText(t, Config.width / 2, Config.height / 2);
  }
}