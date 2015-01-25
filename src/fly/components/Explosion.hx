package fly.components;

import minicanvas.MiniCanvas;

/**
Components should not have logic but I wanted to experiment with
something a little different. The result is good but I am not enthusiastic
about the technique.
*/
class Explosion implements edge.IComponent {
  var stage : Int;
  var draw : Int -> Position -> MiniCanvas -> Void;

  public static var maxStage = 30;
  public static var peak = 20;
  public static var radius = 50;
  public static function create() {
    var offset = 20,
        size = (radius + Math.ceil(offset)) * 2,
        mini = MiniCanvas.create(size, size),
        a = Math.random() * Math.PI;
    mini.ctx.translate(size / 2, size / 2);
    mini.ctx.rotate(a);
    mini.dot(-offset / 2, -offset / 2, radius, 0xFFCC3399);
    mini.dot(-offset / 4, -offset / 4, radius, 0xFF0000CC);
    mini.ctx.globalCompositeOperation = "destination-out";
    mini.dot(0, 0, radius, 0xFFFFFFFF);
    mini.ctx.globalCompositeOperation = "source-over";
    mini.dot(offset / 4, offset / 4, radius, 0xFFFFFF66);
    return new Explosion(
        maxStage,
        function(stage, pos : Position, m : MiniCanvas) {
          var s =
                (stage > peak ?
                  1 - (stage - peak) / (maxStage - peak) :
                  1 - (peak - stage) / peak
                ),
              w = size * s;
          m.ctx.drawImage(mini.canvas, pos.x - w / 2, pos.y - w / 2, w, w);
        });
  }
}