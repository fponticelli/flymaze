import amaze.Cell;
import amaze.Maze;
import js.html.CanvasRenderingContext2D;
using thx.core.Floats;
import thx.core.Timer;
import thx.math.random.PseudoRandom;
import sui.Sui;

class Main {
  static var width = 640;
  static var height = 480;
  static var cols = 16;
  static var rows = 12;
  static var startColumn = 8;
  static var startRow = 8;
  static var cellSize = 40;
  static var maze = new Maze(cols, rows, new PseudoRandom(Std.int(Math.random() * 10000)));
  static var mini = MiniCanvas.create(width, height).display("flymaze");
  static var fly : Fly;
  static var delta = 50;

  public static function main() {
    fly = new Fly((startColumn + 0.5) * cellSize, (startRow + 0.5) * cellSize, maze, cellSize);
    var f = drawMaze(maze, fly);
    var remainder = 0.0;


    mini.onKeyRepeat(function(e) for(code in e.keyCodes) switch code {
      case 39, 68: // right
        fly.right();
      case 37, 65: // left
        fly.left();
      case 38, 87: // accellerate
        fly.accellerate();
      case 40, 83: // decellerate
        fly.decellerate();
      case c: trace(c);
    });

//    Timer.repeat(function() {
//      maze.generate(fly.row, fly.col);
//    }, 10000);

    Timer.frame(function(t) {
      t += remainder;
      while(t > delta) {
        t -= delta;
        update();
      }
      remainder = t;
      mini
        .clear()
        //.dotGrid(10)
        //.checkboard(20, 0xFFFFFFFF, 0xEEEEEEFF)
        //.fill(0xFFFFFF66)
        .with(drawFly)
        .with(f)
        .border(5, 0xAAAAAAFF)
      ;
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
        radius = fly.radius,
        w = radius / fly.trail.length,
        scale = 2,
        counter = 1,
        colora = "rgba(0,0,0,0.5)", // "#000000",
        colorb = "rgba(255,255,255,0.8)"; // "#ffffff";
    //mini.ctx.lineWidth = w;

    mini.ctx.lineCap = "round";
    for(i in p+1...fly.trail.length) {
      mini.ctx.beginPath();
      mini.ctx.strokeStyle = counter % 2 != 0 ? colora : colorb;
      mini.ctx.lineWidth = (w * scale * counter++).max(1);
      mini.ctx.moveTo(fly.trail[i-1].x, fly.trail[i-1].y);
      mini.ctx.lineTo(fly.trail[i].x, fly.trail[i].y);
      mini.ctx.stroke();
    }

    for(i in 0...p) {
      mini.ctx.beginPath();
      mini.ctx.strokeStyle = counter % 2 != 0 ? colora : colorb;
      mini.ctx.lineWidth = (w * scale * counter++).max(1);
      var ip = (i == 0 ? fly.trail.length : i) - 1;
      mini.ctx.moveTo(fly.trail[ip].x, fly.trail[ip].y);
      mini.ctx.lineTo(fly.trail[i].x, fly.trail[i].y);
      mini.ctx.stroke();
    }
    mini.dot(fly.x, fly.y, radius, 0x000000FF);
  }

  static function drawMaze(maze : Maze, fly : Fly) {
    maze.generate(startRow, startColumn);
    maze.cells[startRow][startColumn].top = true;
    maze.cells[startRow-1][startColumn].bottom = true;
    return function(mini : MiniCanvas) {
      //mini.ctx.fillStyle = "rgba(255,255,255,0.5)";
      //mini.ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
      mini.ctx.save();
      mini.ctx.lineWidth = 5;
      for(row in 0...maze.cells.length) {
        var cells = maze.cells[row];
        for(col in 0...cells.length) {
          var cell = cells[col];
/*
          mini.ctx.shadowColor = "rgba(0,0,0,0.4)";
          mini.ctx.shadowOffsetX = 6;
          mini.ctx.shadowOffsetY = 6;
          mini.ctx.shadowBlur = 4;
*/
          mini.ctx.lineCap = "square";
          mini.ctx.strokeStyle = "#CCCCCC";
          mini.ctx.beginPath();
          drawCell(mini.ctx, cell, row, col, cellSize);
          mini.ctx.stroke();
        }
      }
      mini.ctx.strokeRect(0.5, 0.5, cols * cellSize, rows * cellSize);
      mini.ctx.restore();
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