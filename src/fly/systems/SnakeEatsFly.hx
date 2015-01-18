package fly.systems;

import edge.*;
import fly.components.*;

class SnakeEatsFly implements ISystem {
  var world : World;
  var sqdistance : Float;
  public var entities : Array<{ position : Position, fly : Fly, entity : Entity }>;
  public function new(world : World, distance : Float) {
    this.world = world;
    this.entities = [];
    this.sqdistance = distance * distance;
  }

  public function update(position : Position, snake : Snake) {
    //trace(entities.length);
    var dx, dy;
    for(o in entities) {
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        world.removeEntity(o.entity);
        snake.jumping.push(0);
      }
    }
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>>
    return [Position, Snake];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return [
      { name : "position", cls : Position },
      { name : "fly", cls : Fly }
    ];

  public function toString() return "SnakeEatsFly";
}