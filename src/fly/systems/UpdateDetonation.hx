package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class UpdateDetonation implements ISystem {
  var entity : Entity;
  var engine : Engine;
  var entities : Iterator<{ position : Position, edible : Edible, entity : Entity }>;
  var score : Score;
  var scoreDivisor : Int;
  public function new(score : Score, scoreDivisor : Int) {
    this.score = score;
    this.scoreDivisor = scoreDivisor;
  }

  function update(detonation : Detonation, position : Position) {
    var sqdistance = detonation.radius * detonation.radius,
        dx, dy;
    for(o in entities) {
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        engine.remove(o.entity);
        score.value += Math.round(o.edible.score / scoreDivisor);
        //engine.add(new Entity([o.position, Droplet.create()]));
      }
    }
    entity.remove(detonation);
  }
}