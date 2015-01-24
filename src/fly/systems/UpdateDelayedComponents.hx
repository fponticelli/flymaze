package fly.systems;

import edge.*;
import fly.components.DelayedComponents;

class UpdateDelayedComponents implements ISystem {
  public var entity : Entity;
  public function update(item : DelayedComponents) {
    if(item.ticks <= 0) {
      entity.removeTypes(item.toRemove);
      entity.addMany(item.toAdd);
    } else {
      item.ticks--;
    }
  }
}