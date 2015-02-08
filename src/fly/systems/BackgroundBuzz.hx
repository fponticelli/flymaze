package fly.systems;

import edge.*;
import fly.components.*;

class BackgroundBuzz implements ISystem {
  var engine : Engine;
  var counter = 0;
  var delay = 300;
  var entities : View<{ audio : Audio }>;
  function update() {
    if(entities.count == 0)
      counter = 0;
    else {
      counter++;
      if(counter >= delay) {
        engine.create([Audio.buzzing]);
        counter = 0;
      }
    }
  }
}