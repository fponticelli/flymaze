package fly.util;

using thx.core.Arrays;

class Persona {
  public static var adjectives = Macro.fileToArray("src/fly/util/adjectives.txt");
  public static var nouns = Macro.fileToArray("src/fly/util/nouns.txt");

  public static function create() {
    var n = Math.floor(Math.random() * 3);
    return [for(_ in 0...n) adjectives.sampleOne()].concat([nouns.sampleOne()]).join(" ");
  }
}