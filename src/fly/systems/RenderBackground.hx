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

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return null;

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "RenderBackground";
}