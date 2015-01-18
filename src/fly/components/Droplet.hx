package fly.components;

import thx.color.*;

class Droplet {
  public var radius : Float;
  public var color : RGB;
  public function new() {
    radius = Math.random() * 0.5 + 1.2;
    color = HSL.create(20 + 30 * Math.random(), Math.random() * 0.4 + 0.6, 0.3);
  }

  public function toString()
    return 'Droplet';
}