package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateExplosion implements ISystem {
  public var entity : Entity;
  public var engine : Engine;
  public function update(explosion : Explosion) {
    if(explosion.stage == Explosion.maxStage)
      entity.add(Detonation.instance);
    explosion.stage--;
    if(explosion.stage <= 0)
      engine.remove(entity);
  }
}