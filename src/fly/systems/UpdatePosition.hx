package fly.systems;

import edge.*;

import fly.components.Direction;
import fly.components.Position;
import fly.components.Velocity;

using thx.core.Tuple;

class UpdatePosition implements ISystem<Tuple3<Position, Direction, Velocity>> {
  public function new() {}

  public function process(t : Tuple3<Position, Direction, Velocity>) {

  }
}