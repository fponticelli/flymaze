package fly.systems;

import edge.ISystem;
import fly.components.Position;
import fly.components.Trail;


class UpdateTrail implements ISystem {
  public function new() {}

  public function update(position : Position, trail : Trail) {
    trail.trail[trail.pos].x = position.x;
    trail.trail[trail.pos].y = position.y;
    trail.pos++;
    if(trail.pos >= trail.trail.length)
      trail.pos = 0;
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Trail];

  public function toString() return "UpdateTrail";
}