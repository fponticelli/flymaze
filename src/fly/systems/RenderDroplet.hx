package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;

class RenderDroplet implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(position : Position, droplet : Droplet) {
    mini.dot(
      position.x+1,
      position.y+1,
      droplet.radius+0.5,
      droplet.color.darker(0.5)
    );

    mini.dot(
      position.x,
      position.y,
      droplet.radius,
      droplet.color
    );

  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Droplet];

  public function toString() return "RenderDroplet";
}