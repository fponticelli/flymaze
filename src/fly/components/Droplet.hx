package fly.components;

import thx.math.random.Random;

import thx.color.*;

class Droplet implements edge.IComponent {
  var radius : Float;
  var color : RGB;
  var life : Int;
  public static var maxLife = 300;
  public static function create()
    return new Droplet(
      Math.random() * 0.5 + 1.2,
      HSL.create(20 + 30 * Math.random(), Math.random() * 0.4 + 0.6, 0.3),
      maxLife
    );
}