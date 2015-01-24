import fly.Config;
import sui.Sui;

import fly.Game;
import fly.components.Position;
import fly.components.Flower;
import fly.systems.RenderFlower;

class Main {
  public static function main() {
    var config = new Config(),
        mini = MiniCanvas.create(config.width, config.height).display("flymaze"),
        game = new fly.Game(mini, config);
    game.start();
    decorateBackground();
/*
    var sui = new Sui();
    sui.bind(maze.width);
    sui.bind(maze.height);
    sui.bind(cellSize);
    sui.attach();
    //sui.bind(function() maze.generate.bind(rows - 1, Math.floor(cols / 2)));
*/
  }

  public static function decorateBackground() {
    var w = 300,
        h = 300,
        s = 20,
        mini = MiniCanvas
            .create(w, h)
            .fill(0x333333FF),
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
    mini.fill(0xFFFFFF99);

    el.style.backgroundSize = '${w}px ${h}px';
    el.style.backgroundImage = 'url(${mini.canvas.toDataURL("image/png")})';
  }
}