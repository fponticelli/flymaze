package fly.systems;

import edge.*;
import fly.components.*;

class UpdatePreviousPosition implements ISystem {
  public function new() {}

  public function update(previous : PreviousPosition, position : Position) {
    previous.x = position.x;
    previous.y = position.y;
  }

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [PreviousPosition, Position];
  public var entityRequirements(default, null) = null;

  public function toString() return "UpdatePreviousPosition";
}