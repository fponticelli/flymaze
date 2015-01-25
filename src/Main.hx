import fly.components.GameInfo;
import fly.Config;

import fly.Game;
import fly.components.Position;
import fly.components.Flower;
import fly.systems.RenderFlower;
import thx.core.Timer;

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
    // TODO display spash screen
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        mini.offKeyUp();
        var info = new GameInfo(0, 0, 0, 0);
        playLevel(info);
      });
    }, 1000);
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
    // TODO display screen
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        mini.offKeyUp();
        playLevel(info);
      });
    }, 1000);
  }

  static function gameOver(info : GameInfo) {
    // TODO display screen
    Timer.delay(function() {
      mini.onKeyUp(function(e) {
        mini.offKeyUp();
        var info = new GameInfo(0, 0, 0, 0);
        playLevel(info);
      });
    }, 1000);
  }

  public static function decorateBackground() {
    var w = 300,
        h = 300,
        s = 20,
        mini = MiniCanvas
            .create(w, h)
            .fill(0x88CC00FF),
            //.display("flowers"),
        render = new RenderFlower(mini, 400, s),
        p = new Position(0, 0),
        f = new Flower(0),
        el = js.Browser.document.querySelector("figure.minicanvas");
    var double;
    for(i in 0...1500) {
        double = false;
        p.x = w * Math.random();
        p.y = h * Math.random();
        f.id++;
        render.update(p, f);
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
            render.update(p, f);
    }
    mini.fill(0xFFFFFFCC);

    el.style.backgroundSize = '${w}px ${h}px';
    el.style.backgroundImage = 'url(${mini.canvas.toDataURL("image/png")})';
  }
}