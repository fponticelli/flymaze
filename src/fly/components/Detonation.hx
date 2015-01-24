package fly.components;

import minicanvas.MiniCanvas;

class Detonation implements edge.IComponent {
  var radius : Float;

  public static var instance = new Detonation(Explosion.radius);
}