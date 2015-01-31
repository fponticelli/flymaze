package fly.util;

import js.Browser;

using DateTools;

class Cookie {
  public static function create(name : String, value : String, days = 0.0) {
    var expires = if (days > 0) {
      var date = Date.now().delta(days*24*60*60*1000);
      "; expires=" + untyped date.toGMTString();
    } else "";
    Browser.document.cookie = name+"="+value+expires+"; path=/";
  }

  public static function read(name : String) {
    var nameEQ = name + "=",
        ca = Browser.document.cookie.split(';'),
        c;
    for(i in 0...ca.length) {
      c = ca[i];
      while (c.charAt(0) == ' ')
        c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0)
        return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  public static function erase(name : String)
    create(name, "", -1);
}