package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.Floats;

class UpdateDetonation implements ISystem {
  var entity : Entity;
  var engine : Engine;
  var targets : View<{ position : Position, edible : Edible }>;
  var gameInfo : GameInfo;
  var scoreDivisor : Int;
  public function new(gameInfo : GameInfo, scoreDivisor : Int) {
    this.gameInfo = gameInfo;
    this.scoreDivisor = scoreDivisor;
  }

  function update(detonation : Detonation, position : Position) {
    var sqdistance = detonation.radius * detonation.radius,
        dx, dy, o;
    for(item in targets) {
      o = item.data;
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        item.entity.destroy();
        gameInfo.score += Math.round(o.edible.score / scoreDivisor);
        if(o.edible.countToPassLevel)
          gameInfo.toPassLevel--;
      }
    }
    entity.remove(detonation);
  }
}