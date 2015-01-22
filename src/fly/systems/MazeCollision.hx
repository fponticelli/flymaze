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

  public function update(a : PreviousPosition, b : Position, d : Direction, maze : Maze) {
    var bx = Std.int(b.x / cellSize),
        by = Std.int(b.y / cellSize),
        col = Std.int(a.x / cellSize),
        row = Std.int(a.y / cellSize);

    if(bx == col && by == row) // no change in cell, nothing to do
      return;

    var cell = maze.cells[row][col];

    if(b.x <= col * cellSize && !cell.left) {
      // crossing left
      b.x = 2 * col * cellSize - b.x;
      d.angle = -d.angle + Math.PI;
    } else if(b.x >= (col + 1) * cellSize && !cell.right) {
      // crossing right
      b.x = 2 * (col + 1) * cellSize - b.x;
      d.angle = -d.angle + Math.PI;
    }
    if(b.y <= row * cellSize && !cell.top) {
      // crossing top
      b.y = 2 * row * cellSize - b.y;
      d.angle = -d.angle;
    } else if(b.y >= (row + 1) * cellSize && !cell.bottom) {
      // crossing bottom
      b.y = 2 * (row + 1) * cellSize - b.y;
      d.angle = -d.angle;
    }
  }

  public var componentRequirements(default, null) : Array<Class<Dynamic>> = [PreviousPosition, Position, Direction, Maze];
  public var entityRequirements(default, null) = null;
}