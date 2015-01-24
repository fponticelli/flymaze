package fly.systems;

import edge.*;
import fly.components.Direction;
import fly.components.Position;
import fly.components.Velocity;

class UpdatePosition implements ISystem {
  function update(position : Position, direction : Direction, velocity : Velocity) {
    position.x += direction.dx * velocity.value;
    position.y += direction.dy * velocity.value;
  }
}