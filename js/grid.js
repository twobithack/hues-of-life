export class Grid
{
  constructor(width, height, mergeFunction)
  {
    this.width = width;
    this.height = height;
    this.merge = mergeFunction;
    
    this.cells = [];
    for (let x = 0; x < width; x++)
      this.cells[x] = [];
  }

  iterate()
  {
    let nextIteration = [];
    for (let x = 0; x < this.width; x++)
    {
      nextIteration[x] = []
      for (let y = 0; y < this.height; y++)
      {
        let neighbors = this.#getNeighbors(x, y);
        let nextState = null;
        
        let currentState = this.get(x, y);
        if (currentState)
        {
          if (neighbors.length === 2 || 
              neighbors.length === 3)
            nextState = currentState;
        }
        else
        {
          if (neighbors.length === 3)
            nextState = this.merge(neighbors);
        }
        
        nextIteration[x][y] = nextState;
      }
    }

    this.cells = [...nextIteration];
  }

  get(x, y)
  {
    let xWrapped = (x + this.width) % this.width;
    let yWrapped = (y + this.height) % this.height;
    return this.cells[xWrapped][yWrapped];
  }

  set(x, y, color)
  {
    this.cells[x][y] = color;
  }

  #getNeighbors(x, y)
  {
    let neighbors = [];

    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
      {
        if (dx == 0 && dy == 0)
          continue;
        
        let cell = this.get(x + dx, y + dy);
        if (cell)
          neighbors.push(cell);
      }
    
    return neighbors;
  }
}