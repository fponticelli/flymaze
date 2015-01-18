package fly.systems;

import edge.*;
import fly.components.Position;
import fly.components.Snake;
import minicanvas.MiniCanvas;
using thx.core.Floats;

class RenderSnake implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(position : Position, snake : Snake) {
    var pos = 0;
    snake.map(function(a, b) {
      var s = (pos / snake.trail.length).interpolate(snake.trailWidth, snake.headWidth);
      mini.line(a.x, a.y, b.x, b.y, s, snake.colors[pos % snake.colors.length]);
      pos++;
    });
    mini.dot(position.x, position.y, snake.headWidth, snake.colors[pos % snake.colors.length]);
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [Position, Snake];

  public function toString() return "RenderSnake";
}