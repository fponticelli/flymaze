package fly.components;

import thx.math.random.Random;

class Fly implements edge.IComponent {
  var height : Float;

  public static function create(gen : Random)
    return new Fly(gen.float() * 5);
}