package fly.systems;

import edge.*;
import fly.components.Position;
import minicanvas.MiniCanvas;

class RenderPosition implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(position : Position) {
    mini.dot(position.x, position.y, 9, 0x99BBCC66);
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Position];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "RenderPosition";
}