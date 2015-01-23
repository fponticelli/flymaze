package fly.systems;

import amaze.Maze;
import edge.*;
import fly.components.*;
using thx.core.Floats;

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
    } else if(dcol < col && drow < row) {
      if(pos(col * cellSize, row * cellSize, p.x, p.y, dx, dy) > 0) {
        if(!cell.top) {
          if(!cell.left) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle;
          }
        } else if(null != maze.cells[row-1][col] && !maze.cells[row-1][col].left) {
          d.angle = -d.angle + Math.PI;
        }
      } else {
        if(!cell.left) {
          if(!cell.top) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
        } else if(null != maze.cells[row][col-1] && !maze.cells[row][col-1].top) {
          d.angle = -d.angle;
        }
      }
    } else if(dcol > col && drow > row) {
      if(pos(col * cellSize, row * cellSize, p.x, p.y, dx, dy) > 0) {
        if(!cell.bottom) {
          if(!cell.right) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle;
          }
        } else if(null != maze.cells[row+1][col] && !maze.cells[row+1][col].right) {
          d.angle = -d.angle + Math.PI;
        }
      } else {
        if(!cell.right) {
          if(!cell.bottom) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
        } else if(null != maze.cells[row][col+1] && !maze.cells[row][col+1].bottom) {
          d.angle = -d.angle;
        }
      }
    } else if(dcol < col && drow > row) {
      if(pos(col * cellSize, row * cellSize, p.x, p.y, dx, dy) > 0) {
        if(!cell.bottom) {
          if(!cell.left) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle;
          }
        } else if(null != maze.cells[row+1][col] && !maze.cells[row+1][col].left) {
          d.angle = -d.angle + Math.PI;
        }
      } else {
        if(!cell.left) {
          if(!cell.bottom) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
        } else if(null != maze.cells[row][col-1] && !maze.cells[row][col-1].bottom) {
          d.angle = -d.angle;
        }
      }
    } else if(dcol > col && drow < row) {
      if(pos(col * cellSize, row * cellSize, p.x, p.y, dx, dy) > 0) {
        if(!cell.top) {
          if(!cell.right) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle;
          }
        } else if(null != maze.cells[row-1][col] && !maze.cells[row-1][col].right) {
          d.angle = -d.angle + Math.PI;
        }
      } else {
        if(!cell.right) {
          if(!cell.top) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
        } else if(null != maze.cells[row][col+1] && !maze.cells[row][col+1].top) {
          d.angle = -d.angle;
        }
      }
    }
  }

  function pos(x : Float, y : Float, ax : Float, ay : Float, bx : Float, by : Float)
    return ((bx - ax) * (y - ay) - (by - ay) * (x - ax)).sign();
}