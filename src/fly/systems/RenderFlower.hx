package fly.systems;

import edge.*;
import fly.components.*;
import js.html.Image;
import minicanvas.MiniCanvas;
using thx.core.Floats;
import thx.color.*;

class RenderFlower implements ISystem {
  var mini : MiniCanvas;
  var size : Int;
  var images : Array<Image>;
  public function new(mini : MiniCanvas, cells : Int, size : Int) {
    this.mini = mini;
    this.size = size;
    this.images = [];
    var src = MiniCanvas.create(size, size); //.display("flowers");
    for(cell in 0...cells) {
      images.push(generate(src, size));
    }
  }

  public function update(position : Position, f : Flower) {
    var image = images[f.id % images.length];
    mini.ctx.drawImage(image, position.x - size / 2, position.y - size / 2, size, size);
  }

  static function generate(mini : MiniCanvas, size : Int) {
    var ctx = mini.ctx,
        c = size / 2;
    ctx.clearRect(0, 0, size, size);
    // petals
    var n = Std.int(Math.random() * 6) + 5,
        r1 = Math.random() * size / 4 + 1,
        r2 = (Math.random() * c * n / 10 + r1).min(c),
        rp = (r2 - r1) / 2,
        r = rp + r1,
        sa = Math.random() * Math.PI;

    // dot
    var angle = 180 + 200 * Math.random();
    if(angle > 270)
      angle += 70;
    var pcolor = HSL.create(angle, Math.random(), Math.random() * 0.3 + 0.5);
    for(i in 0...n) {
      var a = sa + Math.PI * 2 * i / n;
      mini.dot(c + Math.cos(a) * r, c + Math.sin(a) * r, rp, pcolor);
    }
    pcolor = pcolor.lighter(Math.random());
    mini.dot(c, c, r1, pcolor);
    var image = new Image();
    image.width = untyped mini.width / 2;
    image.height = untyped mini.height / 2;
    image.src = mini.canvas.toDataURL();
    return image;
  }
}