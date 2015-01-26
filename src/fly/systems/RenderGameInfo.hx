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
    mini.ctx.font = "14px 'Montserrat', sans-serif";
    mini.ctx.textBaseline = "bottom";
    mini.ctx.textAlign = "left";
    mini.ctx.lineWidth = 4;
    mini.ctx.strokeStyle = "#FFFFFF";
    mini.ctx.fillStyle = "#000000";
    var messages = [
      'score ${gameInfo.score.number(0)}',
      'time ${gameInfo.timeLeft.number(1)}',
      'flies ${gameInfo.toPassLevel.number(0)}',
      'level ${gameInfo.level.number(0)}',
    ];
    for(i in 0...messages.length) {
      var message = messages[i];
      mini.ctx.strokeText(message, 10, (1 + i) * 20);
      mini.ctx.fillText(message, 10, (1 + i) * 20);
    }

    if(gameInfo.mute) {
      mini.ctx.font = "36px 'FontAwesome'";
      var message = String.fromCharCode(0xF05E);
      mini.ctx.strokeText(message, Config.width - 35, 38);
      mini.ctx.fillText(message, Config.width - 35, 38);

      mini.ctx.font = "28px 'FontAwesome'";
      var message = String.fromCharCode(0xF026);
      mini.ctx.strokeText(message, Config.width - 27, 34);
      mini.ctx.fillText(message, Config.width - 27, 34);

    }
  }
}