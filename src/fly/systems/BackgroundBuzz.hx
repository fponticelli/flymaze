package fly.systems;

import edge.*;
import fly.components.*;

class BackgroundBuzz implements ISystem {
  var engine : Engine;
  var counter = 0;
  var delay = 300;
  var entities : Iterator<{ audio : Audio, entity : Entity }>;
  function update() {
    if(entities.hasNext())
      counter = 0;
    else {
      counter++;
      if(counter >= delay) {
        engine.add(new Entity([Audio.buzzing]));
        counter = 0;
      }
    }
  }
}