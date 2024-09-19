export class Life
{
  constructor({width, height}, mergeFunction)
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
    const nextIteration = [];
    for (let x = 0; x < this.width; x++)
    {
      nextIteration[x] = []
      for (let y = 0; y < this.height; y++)
      {
        const neighbors = this.#getNeighbors(x, y);
        const state = this.get(x, y);

        if (state)
        {
          if (neighbors.length === 2 || 
              neighbors.length === 3)
            nextIteration[x][y] = state;
        }
        else
        {
          if (neighbors.length === 3)
            nextIteration[x][y] = this.merge(neighbors);
        }
      }
    }

    this.cells = [...nextIteration];
  }

  get(x, y)
  {
    const xWrapped = (x + this.width) % this.width;
    const yWrapped = (y + this.height) % this.height;
    return this.cells[xWrapped][yWrapped];
  }

  set(x, y, color)
  {
    const xWrapped = x % this.width;
    const yWrapped = y % this.height;
    this.cells[xWrapped][yWrapped] = color;
  }

  #getNeighbors(x, y)
  {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
      {
        if (dx == 0 && dy == 0)
          continue;
        
        const cell = this.get(x + dx, y + dy);
        if (cell)
          neighbors.push(cell);
      }
    
    return neighbors;
  }
}