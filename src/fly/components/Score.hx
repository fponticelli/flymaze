package fly.components;

import thx.math.random.Random;

class Score {
  public var value : Int;
  public function new()
    this.value = 0;

  public function toString()
    return 'Score($value)';
}