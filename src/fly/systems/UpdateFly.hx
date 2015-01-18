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

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Fly];

  public function toString() return "UpdateFly";
}