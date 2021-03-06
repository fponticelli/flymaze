package fly.systems;

import edge.*;
import fly.components.*;
using thx.Floats;

class MazeCollision implements ISystem {
  static inline var E = 0.00001;
  var cellSize : Float;
  var engine : Engine;
  public function new(cellSize : Float) {
    this.cellSize = cellSize;
  }

  function update(p : Position, d : Direction, v : Velocity, maze : Maze) {
    var dx   = p.x + d.dx * v.value,
        dy   = p.y + d.dy * v.value,
        dcol = Math.floor(dx / cellSize),
        drow = Math.floor(dy / cellSize),
        col  = Math.floor(p.x / cellSize),
        row  = Math.floor(p.y / cellSize),
        cells = maze.maze.cells;

    if(dcol == col && drow == row) // no change in cell, nothing to do
      return;
    var cell = cells[row][col];
    if(dcol == col) {
      if(drow < row && !cell.top || drow > row && !cell.bottom) {
        d.angle = -d.angle;
        addSound();
      }
    } else if(drow == row) {
      if(dcol < col && !cell.left || dcol > col && !cell.right) {
        d.angle = -d.angle + Math.PI;
        addSound();
      }
    } else if(dcol < col && drow < row) {
      if(pos(col * cellSize, row * cellSize, p.x, p.y, dx, dy) > 0) {
        if(!cell.top) {
          if(!cell.left) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle;
          }
          addSound();
        } else if(null != cells[row-1][col] && !cells[row-1][col].left) {
          d.angle = -d.angle + Math.PI;
          addSound();
        }
      } else {
        if(!cell.left) {
          if(!cell.top) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
          addSound();
        } else if(null != cells[row][col-1] && !cells[row][col-1].top) {
          d.angle = -d.angle;
          addSound();
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
          addSound();
        } else if(null != cells[row+1][col] && !cells[row+1][col].right) {
          d.angle = -d.angle + Math.PI;
          addSound();
        }
      } else {
        if(!cell.right) {
          if(!cell.bottom) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
          addSound();
        } else if(null != cells[row][col+1] && !cells[row][col+1].bottom) {
          d.angle = -d.angle;
          addSound();
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
          addSound();
        } else if(null != cells[row+1][col] && !cells[row+1][col].left) {
          d.angle = -d.angle + Math.PI;
          addSound();
        }
      } else {
        if(!cell.left) {
          if(!cell.bottom) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
          addSound();
        } else if(null != cells[row][col-1] && !cells[row][col-1].bottom) {
          d.angle = -d.angle;
          addSound();
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
          addSound();
        } else if(null != cells[row-1][col] && !cells[row-1][col].right) {
          d.angle = -d.angle + Math.PI;
        }
      } else {
        if(!cell.right) {
          if(!cell.top) {
            d.angle += Math.PI;
          } else {
            d.angle = -d.angle + Math.PI;
          }
          addSound();
        } else if(null != cells[row][col+1] && !cells[row][col+1].top) {
          d.angle = -d.angle;
          addSound();
        }
      }
    }
  }

  function addSound()
    engine.create([Audio.boing]);

  function pos(x : Float, y : Float, ax : Float, ay : Float, bx : Float, by : Float)
    return ((bx - ax) * (y - ay) - (by - ay) * (x - ax)).sign();
}