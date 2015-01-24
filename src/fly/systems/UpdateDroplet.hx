package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateDroplet implements ISystem {
  public var entity : Entity;
  public var engine : Engine;
  public function update(droplet : Droplet) {
    droplet.life--;
    if(droplet.life <= 0) {
      entity.remove(droplet);
      entity.add(Explosion.create());
    }
  }
}