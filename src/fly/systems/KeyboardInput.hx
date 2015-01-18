package fly.systems;

import edge.*;
import js.Browser;
import thx.core.Set;

class KeyboardInput implements ISystem {
  var callback : Array<Int> -> Void;
  var keys : Set<Int>;
  public function new(callback : Array<Int> -> Void) {
    this.callback = callback;
    keys = Set.create([]);
    Browser.window.addEventListener("keydown", function(e) keys.add(e.keyCode));
    Browser.window.addEventListener("keyup", function(e) keys.remove(e.keyCode));
  }

  public function update()
    if(keys.length > 0)
      callback(keys);

  public function getRequirements() : Array<Class<Dynamic>>
    return [];

  public function toString() return "KeyboardInput";
}