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
    var pos = 0,
        len = snake.trail.length;
    snake.map(function(a, b) {
      var s = (pos / len).interpolate(snake.trailWidth, snake.headWidth);
      mini.ctx.lineCap = "round";
      mini.line(
        a.x, a.y, b.x, b.y,
        s * sizeMult(len - pos, snake.jumping),
        snake.colors[pos % snake.colors.length]);
      pos++;
    });
    mini.dot(position.x, position.y, snake.headWidth * sizeMult(0, snake.jumping) / 1.5, snake.colors[pos % snake.colors.length]);
  }

  function sizeMult(p, jumpings : Array<Int>) {
    var m = 1.0;
    for(j in jumpings) {
      if(j == p) m = m.max(4);
      else if(j + 1 == p || j - 1 == p) m = m.max(3.75);
      else if(j + 2 == p || j - 2 == p) m = m.max(3.5);
      else if(j + 3 == p || j - 3 == p) m = m.max(2.5);
      else if(j + 4 == p || j - 4 == p) m = m.max(1.5);
      else if(j + 5 == p || j - 5 == p) m = m.max(1.25);
    }
    return m;
  }

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [Position, Snake];
  public var entityRequirements(default, null) = null;

  public function toString() return "RenderSnake";
}