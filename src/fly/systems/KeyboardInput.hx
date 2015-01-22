package fly.systems;

import edge.*;
import js.Browser;
import thx.core.Set;

class KeyboardInput implements ISystem {
  var callback : KeyboardEvent -> Void;
  var keys : Set<Int>;
  var event : KeyboardEvent;
  public function new(callback : KeyboardEvent -> Void) {
    this.callback = callback;
    keys = Set.create([]);
    event = new KeyboardEvent(this);
    Browser.window.addEventListener("keydown", function(e) keys.add(e.keyCode));
    Browser.window.addEventListener("keyup", function(e) keys.remove(e.keyCode));
  }

  public function update()
    if(keys.length > 0) {
      event.keys = keys;
      callback(event);
    }
}

@:access(fly.systems.KeyboardInput)
class KeyboardEvent {
  public var keys : Array<Int>;
  var input : KeyboardInput;
  public function new(input : KeyboardInput) {
    this.input = input;
  }
  public function remove(code : Int) {
    input.keys.remove(code);
  }
}