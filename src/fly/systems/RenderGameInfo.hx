package fly.systems;

import edge.*;
import fly.components.*;
import minicanvas.MiniCanvas;
using thx.core.Floats;
using thx.format.NumberFormat;

class RenderGameInfo implements ISystem {
  var mini : MiniCanvas;
  var gameInfo : GameInfo;
  public function new(gameInfo : GameInfo, mini : MiniCanvas) {
    this.mini = mini;
    this.gameInfo = gameInfo;
  }

  function update() {
    mini.ctx.font = "16px 'Montserrat', sans-serif";
    mini.ctx.lineWidth = 4;
    mini.ctx.strokeStyle = "#FFFFFF";
    mini.ctx.fillStyle = "#000000";
    var messages = [
      'score ${gameInfo.score.number(0)}',
      'time ${gameInfo.timeLeft.number(1)}',
      'flies ${gameInfo.flies.number(0)}',
      'level ${gameInfo.level.number(0)}',
    ];
    for(i in 0...messages.length) {
      var message = messages[i];
      mini.ctx.strokeText(message, 10, (1 + i) * 20);
      mini.ctx.fillText(message, 10, (1 + i) * 20);
    }
  }
}