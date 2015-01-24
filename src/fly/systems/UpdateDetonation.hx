package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateDetonation implements ISystem {
  public var entity : Entity;
  public var engine : Engine;
  public var entities : Iterator<{ position : Position, edible : Edible, entity : Entity }>;
  public function update(detonation : Detonation, position : Position) {
    var sqdistance = detonation.radius * detonation.radius,
        dx, dy;
    for(o in entities) {
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        engine.remove(o.entity);
      }
    }
    entity.remove(detonation);
  }
}