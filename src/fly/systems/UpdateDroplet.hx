package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.Floats;

class UpdateDroplet implements ISystem {
  var entity : Entity;
  var engine : Engine;
  function update(droplet : Droplet) {
    droplet.life--;
    if(droplet.life <= 0) {
      entity.remove(droplet);
      entity.add(Explosion.create());
    }
  }
}