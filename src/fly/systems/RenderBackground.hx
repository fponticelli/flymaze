package fly.systems;

import edge.*;
import minicanvas.MiniCanvas;
import thx.color.Rgb;

class RenderBackground implements ISystem {
  var mini : MiniCanvas;
  var color : String;
  public function new(mini : MiniCanvas, color : Rgb) {
    this.mini = mini;
    this.color = color.toCss3();
  }

  function update()
    mini.fill(color);
}
