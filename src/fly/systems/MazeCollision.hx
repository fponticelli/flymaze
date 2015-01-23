package fly.systems;

import amaze.Maze;
import edge.*;
import fly.components.*;

class MazeCollision implements ISystem {
  static inline var E = 0.00001;
  var cellSize : Float;
  public function new(cellSize : Float) {
    this.cellSize = cellSize;
  }

  public function update(p : Position, d : Direction, v : Velocity, maze : Maze) {
    var dx = p.x + d.dx * v.value,
        dy = p.y + d.dy * v.value,
        dcol = Std.int(dx / cellSize),
        drow = Std.int(dy / cellSize),
        col = Std.int(p.x / cellSize),
        row = Std.int(p.y / cellSize);

    if(dcol == col && drow == row) // no change in cell, nothing to do
      return;

    var cell = maze.cells[row][col];

    if(dx <= col * cellSize && !cell.left) {
      // crossing left
      dx = 2 * col * cellSize - dx;
      d.angle = -d.angle + Math.PI;
    } else if(dx >= (col + 1) * cellSize && !cell.right) {
      // crossing right
      dx = 2 * (col + 1) * cellSize - dx;
      d.angle = -d.angle + Math.PI;
    }
    if(dy <= row * cellSize && !cell.top) {
      // crossing top
      dy = 2 * row * cellSize - dy;
      d.angle = -d.angle;
    } else if(dy >= (row + 1) * cellSize && !cell.bottom) {
      // crossing bottom
      dy = 2 * (row + 1) * cellSize - dy;
      d.angle = -d.angle;
    }
  }
}