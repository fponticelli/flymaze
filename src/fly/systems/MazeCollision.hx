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
    var dx   = p.x + d.dx * v.value,
        dy   = p.y + d.dy * v.value,
        dcol = Math.floor(dx / cellSize),
        drow = Math.floor(dy / cellSize),
        col  = Math.floor(p.x / cellSize),
        row  = Math.floor(p.y / cellSize);

    if(dcol == col && drow == row) // no change in cell, nothing to do
      return;
    var cell = maze.cells[row][col];
    if(dcol == col) {
      if(drow < row && !cell.top || drow > row && !cell.bottom)
        d.angle = -d.angle;
    } else if(drow == row) {
      if(dcol < col && !cell.left || dcol > col && !cell.right)
        d.angle = -d.angle + Math.PI;
    }
  }
}