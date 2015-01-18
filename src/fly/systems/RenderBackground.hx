package fly.systems;

import edge.*;

import minicanvas.MiniCanvas;
import thx.color.RGB;

class RenderBackground implements ISystem {
  var mini : MiniCanvas;
  var color : String;
  public function new(mini : MiniCanvas, color : RGB) {
    this.mini = mini;
    this.color = color.toCSS3();
  }


  public function update() {
    mini.fill(color);
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [];

  public function toString() return "RenderBackground";
}