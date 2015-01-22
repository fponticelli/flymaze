package fly.systems;

import edge.*;
import fly.components.*;

class UpdatePreviousPosition implements ISystem {
  public function update(previous : PreviousPosition, position : Position) {
    previous.x = position.x;
    previous.y = position.y;
  }
}