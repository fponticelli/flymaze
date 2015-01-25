package fly.systems;

import edge.*;
import fly.components.*;
using thx.core.Floats;

class UpdateGameInfo implements ISystem {
  var gameInfo : GameInfo;
  var timeDelta : Float;
  var endLevel : Bool -> Void;
  public function new(gameInfo : GameInfo, endLevel : Bool -> Void) {
    this.gameInfo = gameInfo;
    this.endLevel = endLevel;
  }

  function update() {
    gameInfo.timeLeft -= timeDelta / 1000;
    if(gameInfo.toPassLevel <= 0) {
      gameInfo.score += Math.ceil(gameInfo.timeLeft * 10);
      endLevel(true);
    }
    if(gameInfo.timeLeft <= 0) {
      gameInfo.timeLeft = 0;
      endLevel(false);
    }
  }
}