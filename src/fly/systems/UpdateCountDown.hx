package fly.systems;

import fly.components.CountDown;
import edge.*;

class UpdateCountDown implements edge.ISystem {
  var timeDelta : Float;
  var entity : Entity;
  var callback : Void -> Void;
  public function new(callback : Void -> Void) {
    this.callback = callback;
  }

  public function update(countDown : CountDown) {
    countDown.time -= timeDelta / 1000;
    if(countDown.time > 0) return;
    entity.destroy();
    callback();
  }
}