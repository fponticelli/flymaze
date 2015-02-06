package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateDetonation implements ISystem {
  var entity : Entity;
  var engine : Engine;
  var entities : View<{ position : Position, edible : Edible, entity : Entity }>;
  var gameInfo : GameInfo;
  var scoreDivisor : Int;
  public function new(gameInfo : GameInfo, scoreDivisor : Int) {
    this.gameInfo = gameInfo;
    this.scoreDivisor = scoreDivisor;
  }

  function update(detonation : Detonation, position : Position) {
    var sqdistance = detonation.radius * detonation.radius,
        dx, dy, o;
    for(item in entities) {
      o = item.data;
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        o.entity.destroy();
        gameInfo.score += Math.round(o.edible.score / scoreDivisor);
        if(o.edible.countToPassLevel)
          gameInfo.toPassLevel--;
      }
    }
    entity.remove(detonation);
  }
}