package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.Floats;

class UpdateExplosion implements ISystem {
  var entity : Entity;
  var engine : Engine;
  function update(explosion : Explosion) {
    if(explosion.stage == Explosion.maxStage) {
      entity.add(Detonation.instance);
      engine.create([Audio.explosion]);
    }
    explosion.stage--;
    if(explosion.stage <= 0)
      entity.destroy();
  }
}