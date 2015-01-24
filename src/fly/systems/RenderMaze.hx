package fly.systems;

import edge.ISystem;
import js.html.CanvasRenderingContext2D;
import minicanvas.MiniCanvas;
import fly.components.Maze;
import amaze.Cell;
import thx.color.HSLA;
using thx.core.Floats;

class RenderMaze implements ISystem {
  var ctx : CanvasRenderingContext2D;
  var cellSize : Float;
  var mini : MiniCanvas;
  var id = -1;
  public function new(ctx : CanvasRenderingContext2D, cellSize : Float) {
    mini = MiniCanvas.create(ctx.canvas.width, ctx.canvas.height);
    this.ctx = ctx;
    this.cellSize = cellSize;
  }

  function update(maze : Maze) {
    if(id != maze.id) {
      id = maze.id;
      render(maze);
    }
    this.ctx.drawImage(mini.canvas, 0, 0, mini.width, mini.height);
  }

  function render(maze : Maze) {
    var ctx = mini.ctx,
        cells = maze.maze.cells;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for(i in 0...cells.length) {
      var row = cells[i];
      for(j in 0...row.length) {
        var cell = row[j];
        drawCell(cell, i, j, cellSize, i == cells.length - 1, j == row.length - 1);
      }
    }
  }

  function createColor() {
    return HSLA.create(120 + Math.random() * 20, 0.6, 0.3, 1);
  }

  function drawCell(cell : Cell, row : Int, col : Int, size : Float, lastRow : Bool, lastCol : Bool) {
    var ctx = mini.ctx;
    if(!lastCol && !cell.right) {
      vinePath(
        0.5 + (1 + col) * size,
        0.5 + row * size,
        0.5 + (1 + col) * size,
        0.5 + (row + 1) * size,
        20,
        Math.random() * 2.5 + 2.5,
        createColor(),
        40
        );
    }
    if(!lastRow && !cell.bottom) {
      vinePath(
        0.5 + col * size,
        0.5 + (1 + row) * size,
        0.5 + (col + 1) * size,
        0.5 + (1 + row) * size,
        20,
        Math.random() * 2.5 + 2.5,
        createColor(),
        40
        );
    }
  }

  function fdist(x0 : Float, y0 : Float, x1 : Float, y1 : Float) {
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
  }

  function fangle(max : Float) {
    return ((Math.random() * max) - max / 2) * Math.PI / 180;
  }

  var maxAngleDeviation = 2;
  function vinePath(x0 : Float, y0 : Float, x1 : Float, y1 : Float, dist : Float, width : Float, color : HSLA, maxAngle : Float) {
    if(width < 0.5) return;
    var ctx = mini.ctx,
        d = fdist(x0, y0, x1, y1),
        branches = [],
        angle;
    ctx.beginPath();
    ctx.strokeStyle = color.toCSS3();
    ctx.lineWidth = width;
    ctx.moveTo(x0, y0);
    while(d >= dist) {
      angle = Math.atan2(y1 - y0, x1 - x0);
      angle += fangle(maxAngle);
      d = Math.random() * dist;
      x0 += Math.cos(angle) * d;
      y0 += Math.sin(angle) * d;
      ctx.lineTo(x0, y0);
      if(Math.random() < 1) {
        angle += fangle(maxAngle);
        d = Math.random() * d;
        branches.push({
          x0 : x0,
          y0 : y0,
          x1 : x0 + Math.cos(angle) * d,
          y1 : y0 + Math.sin(angle) * d,
          d : d,
          width : width * Math.random() * 0.1 + 0.9
        });
      }
      d = fdist(x0, y0, x1, y1);
    }
    ctx.lineTo(x1, y1);
    ctx.stroke();
    for(branch in branches)
      vinePath(branch.x0, branch.y0, branch.x1, branch.y1, branch.d, branch.width, color.lighter(0.1), (maxAngle * maxAngleDeviation).min(90));
  }
}