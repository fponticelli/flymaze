package fly.components;

import thx.math.random.Random;

class Fly {
  public var height : Float;
  public function new(height : Float)
    this.height = height;

  public static function create(gen : Random)
    return new Fly(gen.float() * 5);

  public function toString()
    return 'Fly';
}