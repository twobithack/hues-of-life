const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const world_size = 50;

var cell_size = 10;
var cell_spacing = 1;
resizeCanvas();

var isPaused = false;
var isDrawing = false;
var drawColor = color(255, 255, 255);

document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', resizeCanvas);

var universe = [];
for (let x = 0; x < world_size; x++)
    universe[x] = [];

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
        {
          cell = universe[x][y];
        }
      }
      else
      {
        if (neighbors == 3)
        {
          cell = blendNeighbors(x, y);
        }
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
    canvas.style.borderColor = 'white';
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

function countNeighbors(x, y)
{
  let count = 0;

  if (getCell(x - 1, y - 1))  count++;
  if (getCell(x - 1, y    ))  count++;
  if (getCell(x - 1, y + 1))  count++;
  if (getCell(x,     y - 1))  count++;
  if (getCell(x,     y + 1))  count++;
  if (getCell(x + 1, y - 1))  count++;
  if (getCell(x + 1, y    ))  count++;
  if (getCell(x + 1, y + 1))  count++;

  return count;
}

function blendNeighbors(x, y)
{
  let neighbors = [];

  neighbors[0] = getCell(x - 1, y - 1);
  neighbors[1] = getCell(x - 1, y    );
  neighbors[2] = getCell(x - 1, y + 1);
  neighbors[3] = getCell(x,     y - 1);
  neighbors[4] = getCell(x,     y + 1);
  neighbors[5] = getCell(x + 1, y - 1);
  neighbors[6] = getCell(x + 1, y    );
  neighbors[7] = getCell(x + 1, y + 1);

  let populated = [];
  let count = 0;

  for (let i = 0; i < 8; i++)
   if (neighbors[i])
   {
    populated[count] = i;
    count++;
   }

  return blendColors(neighbors[populated[0]], 
                     neighbors[populated[1]], 
                     neighbors[populated[2]]);
}

function color(r, g, b)
{
  return {
    "r": r,
    "g": g,
    "b": b
  };
}

function blendColors(c0, c1, c2)
{
  let r = Math.floor((c0.r + c1.r + c2.r) / 3);
  let g = Math.floor((c0.g + c1.g + c2.g) / 3);
  let b = Math.floor((c0.b + c1.b + c2.b) / 3);

  return color(r, g, b);
}

function colorToHex(color) {
  return "#" + decimalToHex(color.r) + decimalToHex(color.g) + decimalToHex(color.b);
}

function decimalToHex(value) {
  let hex = value.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
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
  canvas.style.cursor = "crosshair"; 
}

function handleMouseUp()
{
  isDrawing = false;
  canvas.style.cursor = "default"; 
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