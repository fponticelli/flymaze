package fly.components;

class Fly {
  public var height : Float;
  public function new() {
    height = Math.random() * 5;
  }

  public function toString()
    return 'Fly';
}