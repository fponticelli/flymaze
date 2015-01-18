package fly.systems;

import edge.*;
import fly.components.*;
using thx.core.Floats;

class UpdateFly implements ISystem {
  var width : Float;
  var height : Float;
  public function new(width : Float, height : Float) {
    this.width = width;
    this.height = height;
  }

  public function update(position : Position, fly : Fly) {
    position.x = 0.max(position.x + 2 - Math.random() * 4).min(width);
    position.y = 0.max(position.y + 2 - Math.random() * 4).min(height);
    fly.height = 0.max(fly.height + Math.random() * 1 - 0.5).min(6);
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Position, Fly];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "UpdateFly";
}