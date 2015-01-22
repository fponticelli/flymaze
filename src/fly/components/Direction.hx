package fly.components;

class Direction implements edge.IComponent {
  public var angle : Float;
  public var dx(get, null) : Float;
  public var dy(get, null) : Float;

  function get_dx() return Math.cos(angle);
  function get_dy() return Math.sin(angle);
}