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

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [Position];
  public var entityRequirements(default, null) = null;

  public function toString() return "RenderPosition";
}