package fly.systems;

import edge.*;
import fly.components.*;
using thx.core.Floats;
import thx.math.random.Random;

class UpdateFly implements ISystem {
  var width : Float;
  var height : Float;
  var gen : Random;
  public function new(width : Float, height : Float, gen : Random) {
    this.width = width;
    this.height = height;
    this.gen = gen;
  }

  public function update(position : Position, fly : Fly) {
    position.x = 0.max(position.x + 2 - gen.float() * 4).min(width);
    position.y = 0.max(position.y + 2 - gen.float() * 4).min(height);
    fly.height = 0.max(fly.height + gen.float() * 1 - 0.5).min(6);
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Position, Fly];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "UpdateFly";
}