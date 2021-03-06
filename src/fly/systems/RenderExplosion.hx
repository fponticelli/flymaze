package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.Floats;

class RenderExplosion implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  function update(position : Position, explosion : Explosion)
    explosion.draw(explosion.stage, position, mini);
}