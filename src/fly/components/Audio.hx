package fly.components;

class Audio implements edge.IComponent {
  var name : String;

  public static var buzzing   = new Audio("buzz");
  public static var eatFly    = new Audio("gulp");
  public static var eatFlower = new Audio("crunch");
  public static var poop      = new Audio("poop");
  public static var explosion(get, null) : Audio;
  public static var boing(get, null) : Audio;

  static var explosions = [
    new Audio("exp1"),
    new Audio("exp2"),
    new Audio("exp3")
  ];
  static var explosion_id = 0;
  static function get_explosion() {
    return explosions[explosion_id++ % explosions.length];
  }

  static var boings = [
    new Audio("boing1"),
    new Audio("boing2")
  ];
  static var boing_id = 0;
  static function get_boing() {
    return boings[boing_id++ % boings.length];
  }
}