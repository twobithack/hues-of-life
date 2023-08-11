const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const world_size = 25;

var cell_size;
var cell_spacing;
resizeCanvas();

var isPaused = false;
var isDrawing = false;
var drawColor = color(255, 255, 255);

var universe = [];
for (let x = 0; x < world_size; x++)
    universe[x] = [];

document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', resizeCanvas);

setInterval(update, 100)

function update()
{
  if (!isPaused)
    tick();

  redraw();
}

function tick()
{
  let next = [];

  for (let x = 0; x < world_size; x++)
  {
    next[x] = []
    for (let y = 0; y < world_size; y++)
    {
      let neighbors = countNeighbors(x, y);
      let cell = null;

      if (universe[x][y])
      {
        if (neighbors == 2 || 
            neighbors == 3)
          cell = universe[x][y];
      }
      else
      {
        if (neighbors == 3)
          cell = blendNeighbors(x, y);
      }
      
      next[x][y] = cell;
    }
  }

  universe = [...next];
}

function redraw()
{
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  let count = 0;
  let live = [];

  for (let x = 0; x < world_size; x++)
    for (let y = 0; y < world_size; y++)
    {
      let cell = universe[x][y];
      if (cell)
      {
        drawCell(x, y, cell);
        live[count] = cell;
        count++;
      }
    }

  if (count == 0)
  {
    canvas.style.borderColor = '#ffffff';
  }
  else
  {
    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < count; i++)
    {
      r += live[i].r;
      g += live[i].g;
      b += live[i].b;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    canvas.style.borderColor = colorToHex(color(r, g, b));
  }
  
  context.fillStyle = canvas.style.borderColor;

  for (let x = 1; x < world_size; x++)
    for (let y = 1; y < world_size; y++)
      context.fillRect(x * cell_size - (cell_spacing/2), 
                       y * cell_size - (cell_spacing/2),
                       cell_spacing,
                       cell_spacing);
}

function getCell(x, y)
{
  let xCoord = (x + world_size) % world_size;
  let yCoord = (y + world_size) % world_size;
  return universe[xCoord][yCoord];
}

function setCell(x, y, c)
{
  universe[x][y] = c;
  drawCell(x, y, c);
}

function drawCell(x, y, c)
{
  context.fillStyle = colorToHex(c);
  context.fillRect(x * cell_size + (cell_spacing / 2), 
                   y * cell_size + (cell_spacing / 2), 
                   cell_size - cell_spacing,
                   cell_size - cell_spacing);
}

function getNeighbors(x, y)
{
  let neighbors = [];

  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
    {
      if (dx == 0 && dy == 0)
        continue;
      
      let cell = getCell(x + dx, y + dy);
      if (cell)
        neighbors.push(cell);
    }
  
  return neighbors;
}

function countNeighbors(x, y)
{
  let neighbors = getNeighbors(x, y);
  return neighbors.length;
}

function blendNeighbors(x, y)
{
  let neighbors = getNeighbors(x, y);
  return blend(...neighbors);
}

function color(r, g, b)
{
  return {
    'r': r,
    'g': g,
    'b': b
  };
}

function blend(color0, color1, color2)
{
  let r = Math.floor((color0.r + color1.r + color2.r) / 3);
  let g = Math.floor((color0.g + color1.g + color2.g) / 3);
  let b = Math.floor((color0.b + color1.b + color2.b) / 3);

  return color(r, g, b);
}

function colorToHex(color) {
  return '#' + decimalToHex(color.r) + decimalToHex(color.g) + decimalToHex(color.b);
}

function decimalToHex(value) {
  let hex = value.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function handleKeyPress(event)
{
  switch (event.code)
  {
    case 'Space':
      isPaused = !isPaused;
      return;

    case 'KeyR':
      drawColor = color(255, 0, 0);
      break;
    
    case 'KeyG':
      drawColor = color(0, 255, 0);
      break;

    case 'KeyB':
      drawColor = color(0, 0, 255);
      break;

    case 'KeyC':
      drawColor = color(0, 255, 255);
      break;

    case 'KeyM':
      drawColor = color(255, 0, 255);
      break;

    case 'KeyY':
      drawColor = color(255, 255, 0);
      break;

    case 'KeyK':
      drawColor = color(0, 0, 0);
      break;

    case 'KeyW':
      drawColor = color(255, 255, 255);
      break;

    case 'KeyP':
      drawColor = color(243, 58, 106);
      break;
  
    default: 
      break;
  }
}

function handleMouseDown(event)
{
  isDrawing = true;
  
  let bounds = canvas.getBoundingClientRect();
  let xCoord = Math.floor((event.clientX - bounds.left) / cell_size);
  let yCoord = Math.floor((event.clientY - bounds.top) / cell_size);

  setCell(xCoord, yCoord, drawColor);
  canvas.style.cursor = 'crosshair'; 
}

function handleMouseUp()
{
  isDrawing = false;
  canvas.style.cursor = 'default'; 
}

function handleMouseMove(event)
{
  if (!isDrawing)
    return;
  
  let bounds = canvas.getBoundingClientRect();
  let xCoord = Math.floor((event.clientX - bounds.left) / cell_size);
  let yCoord = Math.floor((event.clientY - bounds.top) / cell_size);

  setCell(xCoord, yCoord, drawColor);
}

function resizeCanvas() {
  let dim = Math.min(window.innerWidth, window.innerHeight) - 10;
  canvas.width = dim;
  canvas.height = dim;

  cell_size = dim / world_size;
  cell_spacing = cell_size / 10;
}