package fly.systems;

import js.html.audio.AudioContext;
import js.html.XMLHttpRequest;
import edge.*;
import fly.components.*;

class PlayAudio implements ISystem {
  var entity : Entity;
  var info : GameInfo;
  public function new(info : GameInfo) {
    this.info = info;
  }

  function update(audio : Audio) {
    if(!info.mute)
      playSound(audio.name);
    entity.destroy();
  }

  static var sounds = new Map();
  static function loadSound(name : String, url : String) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = js.html.XMLHttpRequestResponseType.ARRAYBUFFER;

    // Decode asynchronously
    request.onload = function(_) {
      context.decodeAudioData(
        request.response,
        function(buffer) {
          sounds.set(name, buffer);
          return false;
        }, function() {
          //trace('Error: $e');
          return false;
        });
    }
    request.send();
  }

  public static function playSound(name : String) {
    var b = sounds.get(name);
    if(null == b) return;
    var source = context.createBufferSource();
    source.buffer = b;
    source.connect(context.destination, 0, 0);
    source.start(0);
  }

  static function __init__() {
    loadSound("exp1",     "sound/Buff.mp3");
    loadSound("exp2",     "sound/Buffs.mp3");
    loadSound("exp3",     "sound/Burf.mp3");
    loadSound("boing1",   "sound/Boin.mp3");
    loadSound("boing2",   "sound/Boing.mp3");
    loadSound("buzz",     "sound/Bzzz.mp3");
    loadSound("gulp",     "sound/Gulp.mp3");
    loadSound("crunch",   "sound/Crunch.mp3");
    loadSound("poop",     "sound/Poop.mp3");
    loadSound("start",    "sound/Start.mp3");
    loadSound("success",  "sound/Tadada.mp3");
    loadSound("gameover", "sound/Game over.mp3");
  }

  static var context : AudioContext = untyped __js__("(function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  })()");
}
