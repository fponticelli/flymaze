package fly.systems;

import edge.ISystem;
import js.html.CanvasRenderingContext2D;
import minicanvas.MiniCanvas;
import fly.components.Maze;
import amaze.Cell;

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

  public function update(maze : Maze) {
    if(id != maze.id) {
      id = maze.id;
      render(maze);
    }
    this.ctx.drawImage(mini.canvas, 0, 0, mini.width, mini.height);
  }

  function render(maze : Maze) {
    var ctx = mini.ctx,
        cells = maze.maze.cells;
    ctx.lineWidth = 4;
    ctx.lineCap = "square";
    ctx.strokeStyle = "#669933";
    for(i in 0...cells.length) {
      var row = cells[i];
      for(j in 0...row.length) {
        var cell = row[j];
        ctx.beginPath();
        drawCell(cell, i, j, cellSize, i == cells.length - 1, j == row.length - 1);
        ctx.stroke();
      }
    }
  }

  function drawCell(cell : Cell, row : Int, col : Int, size : Float, lastRow : Bool, lastCol : Bool) {
    var ctx = mini.ctx;
    if(!lastCol && !cell.right) {
      ctx.moveTo(0.5 + (1 + col) * size, 0.5 + row * size);
      ctx.lineTo(0.5 + (1 + col) * size, 0.5 + (row + 1) * size);
    }
    if(!lastRow && !cell.bottom) {
      ctx.moveTo(0.5 + col * size, 0.5 + (1 + row) * size);
      ctx.lineTo(0.5 + (col + 1) * size, 0.5 + (1 + row) * size);
    }
  }
}