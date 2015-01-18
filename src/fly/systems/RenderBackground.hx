package fly.systems;

import edge.*;

import fly.components.StageBackground;
import minicanvas.MiniCanvas;

class RenderBackground implements ISystem {
  var mini : MiniCanvas;
  public function new(mini : MiniCanvas)
    this.mini = mini;

  public function update(stage : StageBackground) {
    mini.fill(stage.color.toCSS3());
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [StageBackground];

  public function toString() return "RenderBackground";
}