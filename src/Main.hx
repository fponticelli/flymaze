import amaze.Cell;
import amaze.Maze;
import js.html.CanvasRenderingContext2D;
import thx.core.Timer;
import thx.math.random.PseudoRandom;
import sui.Sui;

class Main {
  static var width = 641;
  static var height = 520;
  static var cols = 16;
  static var rows = 12;
  static var startColumn = 8;
  static var startRow = 8;
  static var cellSize = 40;
  static var maze = new Maze(cols, rows, new PseudoRandom(11));
  static var mini = MiniCanvas.create(width, height).display("flymaze");
  static var fly : Fly;
  static var delta = 50;

  public static function main() {
    var f = drawMaze(maze);
    var remainder = 0.0;

    fly = new Fly((startColumn + 0.5) * cellSize, (startRow + 0.5) * cellSize);

    mini.onKeyRepeat(function(e) switch e.keyCode {
      case 39, 68: // right
        fly.right();
      case 37, 65: // left
        fly.left();
      case c: trace(c);
    });

    Timer.frame(function(t) {
      t += remainder;
      while(t > delta) {
        t -= delta;
        update();
      }
      remainder = t;
      mini.checkboard()
        .with(f)
        .with(drawFly);
    });

/*
    var sui = new Sui();
    sui.bind(maze.width);
    sui.bind(maze.height);
    sui.bind(cellSize);
    sui.attach();
    //sui.bind(function() maze.generate.bind(rows - 1, Math.floor(cols / 2)));
*/
  }

  static function update() {
    fly.update();
  }

  static function drawFly(mini : MiniCanvas) {
    var p = fly.trailPos,
        w = 1.5;
    if(p == fly.trail.length)
      p = 0;
    //mini.ctx.lineWidth = w;

    for(i in p+1...fly.trail.length) {
      w *= 1.05;
      mini.ctx.beginPath();
      mini.ctx.lineWidth = w;
      mini.ctx.moveTo(fly.trail[i-1].x, fly.trail[i-1].y);
      mini.ctx.lineTo(fly.trail[i].x, fly.trail[i].y);
      mini.ctx.stroke();
    }

    for(i in 0...p) {
      w *= 1.05;
      mini.ctx.beginPath();
      mini.ctx.lineWidth = w;
      var ip = (i == 0 ? fly.trail.length : i) - 1;
      mini.ctx.moveTo(fly.trail[ip].x, fly.trail[ip].y);
      mini.ctx.lineTo(fly.trail[i].x, fly.trail[i].y);
      mini.ctx.stroke();
    }
    mini.dot(fly.x, fly.y, 4, 0x000000FF);
  }

  static function drawMaze(maze : Maze) {
    maze.generate(startRow, startColumn);
    return function(mini : MiniCanvas) {
      mini.ctx.fillStyle = "rgba(255,255,255,0.5)";
      mini.ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
      mini.ctx.lineWidth = 1;
      mini.ctx.strokeStyle = "rgba(0,0,0,0.8)";
      mini.ctx.beginPath();
      for(row in 0...maze.cells.length) {
        var cells = maze.cells[row];
        for(col in 0...cells.length) {
          var cell = cells[col];
          drawCell(mini.ctx, cell, row, col, cellSize);
        }
      }
      mini.ctx.stroke();
      mini.ctx.strokeRect(0.5, 0.5, cols * cellSize, rows * cellSize);
    };
  }

  static function drawCell(ctx : CanvasRenderingContext2D, cell : Cell, row : Int, col : Int, size : Int) {
    if(!cell.right) {
      ctx.moveTo(0.5 + (1 + col) * size, 0.5 + row * size);
      ctx.lineTo(0.5 + (1 + col) * size, 0.5 + (row + 1) * size);
    }
    if(!cell.bottom) {
      ctx.moveTo(0.5 + col * size, 0.5 + (1 + row) * size);
      ctx.lineTo(0.5 + (col + 1) * size, 0.5 + (1 + row) * size);
    }
  }
}