package fly.systems;

import edge.*;
import fly.components.*;

class SnakeEatsFly implements ISystem {
  var engine : Engine;
  var sqdistance : Float;
  public var entities : Array<{ position : Position, fly : Fly, entity : Entity }>;
  public function new(engine : Engine, distance : Float) {
    this.engine = engine;
    this.entities = [];
    this.sqdistance = distance * distance;
  }

  public function update(position : Position, snake : Snake, score : Score) {
    //trace(entities.length);
    var dx, dy;
    for(o in entities) {
      dx = position.x - o.position.x;
      dy = position.y - o.position.y;
      if(dx * dx + dy * dy <= sqdistance) {
        engine.removeEntity(o.entity);
        snake.jumping.push(0);
        score.value++;
      }
    }
  }

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [Position, Snake, Score];
  public var entityRequirements(default, null) : Array<{ name : String , cls : Class<Dynamic> }> = [
      { name : "position", cls : Position },
      { name : "fly", cls : Fly }
    ];

  public function toString() return "SnakeEatsFly";
}