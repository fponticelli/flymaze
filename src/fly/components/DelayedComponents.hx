package fly.components;

import edge.IComponent;

class DelayedComponents implements IComponent {
  var ticks : Int;
  var toAdd : Array<{}>;
  var toRemove : Array<Class<{}>>;

  public function new(ticks : Int, toAdd : Array<{}>, toRemove : Array<Class<{}>>) {
    this.ticks = ticks;
    this.toAdd = null == toAdd ? [] : toAdd;
    this.toRemove = null == toRemove ? [] : toRemove;
  }
}