import fly.components.GameInfo;
import fly.Config;

import fly.Game;
import fly.components.Position;
import fly.components.Flower;
import fly.systems.RenderFlower;
import thx.core.Timer;
using thx.format.NumberFormat;

class Main {
  static var mini : MiniCanvas;
  public static function main() {
    mini = MiniCanvas
      .create(Config.width, Config.height)
      .display("flymaze");

    decorateBackground();
    startScreen();
  }

  static function startScreen() {
    background();
    write("FlyMaze", 48, Config.width / 2, Config.height / 2);
    write("(press bar to start)", 16, Config.width / 2, Config.height / 4 * 3);
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        if(e.keyCode != 32) return;
        mini.offKeyUp();
        var info = new GameInfo(0, 0, 0, 0);
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
    write("Game Over!", 48, Config.width / 2, Config.height / 2);
    write("Final Score " + info.score.number(0) + ' (level ${info.level})', 24, Config.width / 2, Config.height / 4 * 3);
    write("(press bar to start a new game)", 16, Config.width / 2, Config.height / 4 * 3.5);
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        if(e.keyCode != 32) return;
        mini.offKeyUp();
        var info = new GameInfo(0, 0, 0, 0);
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

    el.style.backgroundSize = '${w}px ${h}px';
    el.style.backgroundImage = 'url(${mini.canvas.toDataURL("image/png")})';
  }

  static function write(text : String, size : Float, x : Float, y : Float) {
    mini.ctx.font = size + "px 'Montserrat', sans-serif";
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
}