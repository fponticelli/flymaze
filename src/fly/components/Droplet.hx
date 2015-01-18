package fly.components;

import thx.math.random.Random;

import thx.color.*;

class Droplet {
  public var radius : Float;
  public var color : RGB;
  public function new(radius : Float, color : RGB) {
    this.radius = radius;
    this.color = color;
  }

  public static function create(gen : Random)
    return new Droplet(
      gen.float() * 0.5 + 1.2,
      HSL.create(20 + 30 * gen.float(), gen.float() * 0.4 + 0.6, 0.3)
    );

  public function toString()
    return 'Droplet';
}