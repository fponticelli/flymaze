import fly.components.GameInfo;
import fly.Config;

import fly.Game;
import fly.components.Position;
import fly.components.Flower;
import fly.systems.RenderFlower;
import js.html.Element;
import js.html.InputElement;
import thx.core.Timer;
import thx.core.UUID;
import fly.util.Cookie;
using thx.format.NumberFormat;
using thx.core.Arrays;
using thx.core.Strings;

class Main {
  static var mini : MiniCanvas;
  static var socket : Dynamic = untyped io.connect((~/^http/).replace(js.Browser.location.origin, 'ws'));
  static var cancelGame : Void -> Void;
  static var gameid : String;
  static var info : GameInfo;
  public static function main() {
    mini = MiniCanvas
      .create(Config.width, Config.height)
      .display("flymaze");
    mini.canvas.setAttribute("tabIndex", "1");
    instructions();

    decorateBackground();
    startScreen();

    wireSockets();
  }

  static function sendId(id : String, name : String) {
    socket.emit("id:confirm", { id : id, name : name });
  }

  static function changeName(id : String, name : String) {
    socket.emit("id:change", { id : id, name : name });
  }

  static var id : String;
  static var name : String;

  static function wireSockets() {
    socket.on("request:id", function (_) {
      id = Cookie.read("fmid");
      if(null == id) {
        id = thx.core.UUID.create();
        name = fly.util.Persona.create();
        Cookie.create("fmid", id, 1000);
        Cookie.create("fmname", name, 1000);
      } else {
        name = Cookie.read("fmname");
      }
      leaderboard(name);
      sendId(id, name);
    });

    socket.on("leaderboard:top", function (data) {
      updateLeaderboard(data);
    });
  }

  static function sendScore(final = false) {
    var event = "score:" + (final ? "end" : "play");
    socket.emit(
      event,
      {
        id     : id,
        gameid : gameid,
        score  : info.score,
        level  : info.level,
        time   : Date.now().toString()
      });
  }

  static function startScreen() {
    background();
    write("FlyMaze", 48, Config.width / 2, Config.height / 2);
    write("(press bar to start)", 16, Config.width / 2, Config.height / 4 * 3);
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        if(e.keyCode != 32) return;
        info = new GameInfo(0, 0, 0, 0, false);
        mini.offKeyUp();
        playLevel(info);
      });
    }, 250);
  }

  static function playLevel(info : GameInfo) {
    info.level++;

    var config = new Config(info.level);
    info.timeLeft = config.timePerLevel;
    info.toPassLevel = config.flies;
    var game = new Game(mini, config, info, function(nextLevel) {
          if(nextLevel)
            intermediateScreen(info);
          else
            gameOver(info);
        });
    game.start();

    if(info.level == 1) {
      gameid = UUID.create();
      cancelGame = Timer.repeat(function() {
        if(game.running) {
          sendScore(false);
        }
      }, 5000);
    }
  }

  static function intermediateScreen(info : GameInfo) {
    background();
    write("Level " + info.level + " Completed!", 48, Config.width / 2, Config.height / 2);
    write("current score " + info.score.number(0), 24, Config.width / 2, Config.height / 4 * 3);
    write("(press bar to continue to the next level)", 16, Config.width / 2, Config.height / 4 * 3.5);
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        if(e.keyCode != 32) return;
        mini.offKeyUp();
        playLevel(info);
      });
    }, 250);
  }

  static function gameOver(info : GameInfo) {
    background();
    cancelGame();
    sendScore(true);
    write("Game Over!", 48, Config.width / 2, Config.height / 2);
    write("Final Score " + info.score.number(0) + ' (level ${info.level})', 24, Config.width / 2, Config.height / 4 * 3);
    write("(press bar to start a new game)", 16, Config.width / 2, Config.height / 4 * 3.5);
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        if(e.keyCode != 32) return;
        mini.offKeyUp();
        var info = new GameInfo(0, 0, 0, 0, info.mute);
        playLevel(info);
      });
    }, 250);
  }

  static var flowers : RenderFlower;
  public static function decorateBackground() {
    var w = 300,
        h = 300,
        s = 20,
        mini = MiniCanvas
            .create(w, h)
            .fill(0x88CC00FF),
            //.display("flowers"),
        p = new Position(0, 0),
        f = new Flower(0),
        el = js.Browser.document.querySelector("figure.minicanvas");
    var double;
    flowers = new RenderFlower(mini, 400, s);
    for(i in 0...1500) {
      double = false;
      p.x = w * Math.random();
      p.y = h * Math.random();
      f.id++;
      flowers.update(p, f);
      if(p.x < s) {
        double = true;
        p.x += w;
      } else if (p.x > w - s) {
        double = true;
        p.x -= w;
      }
      if(p.y < s) {
        double = true;
        p.y += h;
      } else if (p.y > w - s) {
        double = true;
        p.y -= h;
      }
      if(double)
        flowers.update(p, f);
    }
    mini.fill(0xFFFFFFCC);

    el.style.backgroundImage = 'url(${mini.canvas.toDataURL("image/png")})';
    el.style.backgroundSize = '${w}px ${h}px';
  }

  static function write(text : String, size : Float, x : Float, y : Float) {
    mini.ctx.font = size + "px 'Montserrat', sans-serif";
    mini.ctx.textBaseline = "bottom";
    mini.ctx.lineWidth = 4;
    mini.ctx.textAlign = "center";
    mini.ctx.strokeStyle = "#FFFFFF";
    mini.ctx.fillStyle = "#000000";
    mini.ctx.strokeText(text, x, y);
    mini.ctx.fillText(text, x, y);
  }

  static function background() {
    mini.clear();
    var p = new Position(0, 0),
        f = new Flower(0);
    flowers.mini = mini;
    for(i in 0...1500) {
      p.x = Math.random() * Config.width;
      p.y = Math.random() * Config.height;
      f.id = i;
      flowers.update(p, f);
    }
  }

  static function instructions() {
    var el = js.Browser.document.querySelector('figcaption');

    var message = '<div class="instructions">
<p>Use <i class="fa fa-caret-square-o-left"></i> <i class="fa fa-caret-square-o-right"></i> (or A/D) to turn.</p>
<p>Kill all the flies within 2 minutes to pass to a new level.</p>
<p>When you eat a flower or a fly, you leave a <em>droplet</em>.<br>They explode after a few seconds and they help to clean-up the area.</p>
<p><em>Pause</em> with spacebar or (P), Mute audio</em> with M.</p>
<p></p>
<p>Sounds Effect Credits go to Gabriel and Matilde Ponticelli</p>
<p>Realized with <a href="http://haxe.org">Haxe</a> and the library <a href="http://github.com/fponticelli/edge">edge</a>. Source code <a href="https://github.com/fponticelli/flymaze">available here</a>.</p>
<p>Copyright © <a href="https://github.com/fponticelli">Franco Ponticelli</a></p>
</div>';
    el.innerHTML = message;
  }

  static var leaderboardElement : Element;
  static var playerNameElement : Element;
  static var playerNameButton : InputElement;
  static function leaderboard(n : String) {
    var el = js.Browser.document.querySelector('figcaption'),
        l  = js.Browser.document.createDivElement();

    l.className = "leaderboard";
    l.innerHTML = '
      <div class="table">
      <table>
        <thead>
          <th>#</th>
          <th>name</th>
          <th>level</th>
          <th>score</th>
        </thead>
        <tbody>
        </tbody>
      </table>
      </div>
      <div class="player">
        your alias is:<br>
        <span class="name">${n.htmlEscape()}</span>
        <br>
        <button>change name</button>
      </div>';
    el.appendChild(l);
    el.appendChild(js.Browser.document.createElement("BR"));
    leaderboardElement = el.querySelector(".leaderboard tbody");
    playerNameElement = el.querySelector(".player span.name");
    playerNameButton = cast el.querySelector(".player button");
    playerNameButton.addEventListener("click", function(_) {
      var newname = js.Browser.window.prompt("input your new name:");
      if(newname == null || (newname = newname.trim()) == "")
        return;
      playerNameElement.innerHTML = name = newname.htmlEscape();
      Cookie.create("fmname", name, 1000);
      changeName(id, name);
    });
  }

  static var old : String;
  static function updateLeaderboard(data : Array<{ name : String, level : Int, score : Int }>) {
    var el = leaderboardElement,
        rows = data.mapi(function(o, i) {
          if(o == null || o.name == null)
            return "";
          return '<tr class="${o.name == name ? "selected" : ""}">
<td>${i+1}</td>
<td>${o.name.htmlEscape()}</td>
<td>${o.level.number(0)}</td>
<td>${o.score.number(0)}</td></tr>';
        }).join("");
    if(old == rows) return;
    el.innerHTML = old = rows;
  }
}