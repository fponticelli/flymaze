package fly.components;

import thx.math.random.Random;

import thx.color.*;

class Droplet implements edge.IComponent {
  var radius : Float;
  var color : RGB;
  public static function create(gen : Random)
    return new Droplet(
      gen.float() * 0.5 + 1.2,
      HSL.create(20 + 30 * gen.float(), gen.float() * 0.4 + 0.6, 0.3)
    );
}