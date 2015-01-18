package fly.systems;

import thx.core.Set;

import edge.*;

class KeyboardInput implements ISystem {
  var callback : Array<Int> -> Void;
  var keys : Set<Int>;
  public function new(callback : Array<Int> -> Void) {
    this.callback = callback;
    keys = Set.create([]);
    js.Browser.window.addEventListener("keydown", function(e) {
      keys.add(e.keyCode);
    });

    js.Browser.window.addEventListener("keyup", function(e) {
      keys.remove(e.keyCode);
    });
  }

  public function update() {
    if(keys.length > 0)
      callback(keys);
  }

  public function getRequirements() : Array<Class<Dynamic>>
    return [];

  public function toString() return "KeyboardInput";
}