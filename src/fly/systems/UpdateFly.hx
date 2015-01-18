package fly.systems;

import edge.*;
import fly.components.*;
using thx.core.Floats;

class UpdateFly implements ISystem {
  public function new() {}

  public function update(position : Position, _ : Fly) {
    position.x += 2 - Math.random() * 4;
    position.y += 2 - Math.random() * 4;
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Position, Fly];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "UpdateFly";
}