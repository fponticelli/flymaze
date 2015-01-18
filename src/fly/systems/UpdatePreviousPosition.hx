package fly.systems;

import edge.*;
import fly.components.*;

class UpdatePreviousPosition implements ISystem {
  public function new() {}

  public function update(previous : PreviousPosition, position : Position) {
    previous.x = position.x;
    previous.y = position.y;
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [PreviousPosition, Position];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;

  public function toString() return "UpdatePreviousPosition";
}