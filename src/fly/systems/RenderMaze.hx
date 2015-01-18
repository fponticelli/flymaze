package fly.systems;

import amaze.*;
import edge.ISystem;
import js.html.CanvasRenderingContext2D;

class RenderMaze implements ISystem {
  var ctx : CanvasRenderingContext2D;
  var cellSize : Float;
  public function new(ctx : CanvasRenderingContext2D, cellSize : Float) {
    this.ctx = ctx;
    this.cellSize = cellSize;
  }

  public function update(maze : Maze) {
    ctx.save();
    ctx.lineWidth = 4;
    for(row in 0...maze.cells.length) {
      var cells = maze.cells[row];
      for(col in 0...cells.length) {
        var cell = cells[col];
        ctx.lineCap = "square";
        ctx.strokeStyle = "#996633";
        ctx.beginPath();
        drawCell(cell, row, col, cellSize);
        ctx.stroke();
      }
    }
    ctx.strokeRect(0.5, 0.5, maze.width * cellSize, maze.height * cellSize);
    ctx.restore();
  }

  function drawCell(cell : Cell, row : Int, col : Int, size : Float) {
    if(!cell.right) {
      ctx.moveTo(0.5 + (1 + col) * size, 0.5 + row * size);
      ctx.lineTo(0.5 + (1 + col) * size, 0.5 + (row + 1) * size);
    }
    if(!cell.bottom) {
      ctx.moveTo(0.5 + col * size, 0.5 + (1 + row) * size);
      ctx.lineTo(0.5 + (col + 1) * size, 0.5 + (1 + row) * size);
    }
  }

  public function getUpdateRequirements() : Array<Class<Dynamic>> return [Maze];

  public function getEntitiesRequirements() : Array<{ name : String , cls : Class<Dynamic> }>
    return null;
}