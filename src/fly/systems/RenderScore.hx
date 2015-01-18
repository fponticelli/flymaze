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
    mini.ctx.font = "12px menlo";
    mini.ctx.fillStyle = "#000000";
    mini.ctx.fillText('${score.value}', 10, 20);
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Score];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "RenderScore";
}