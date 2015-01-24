package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateExplosion implements ISystem {
  var entity : Entity;
  var engine : Engine;
  function update(explosion : Explosion) {
    if(explosion.stage == Explosion.maxStage)
      entity.add(Detonation.instance);
    explosion.stage--;
    if(explosion.stage <= 0)
      engine.remove(entity);
  }
}