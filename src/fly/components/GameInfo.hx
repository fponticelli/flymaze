package fly.components;

import thx.math.random.Random;

class GameInfo implements edge.IComponent {
  var score : Int;
  var toPassLevel : Int;
  var timeLeft : Float;
  var level : Int;
  var mute : Bool;
}