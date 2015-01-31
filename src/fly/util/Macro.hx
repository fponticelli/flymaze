package fly.util;

class Macro {
  macro public static function fileToArray(path : String) {
    var content = sys.io.File.getContent(path),
        lines = content.split("\n");
    return macro $v{lines};
  }
}