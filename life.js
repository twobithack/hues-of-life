const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const hues = [
  color(255,   0,   0), // red
  color(255, 128,   0), // orange
  color(255, 255,   0), // yellow
  color(128, 255,   0), // chartreuse
  color(  0, 255,   0), // green
  color(  0, 255, 128), // spring green
  color(  0, 255, 255), // cyan
  color(  0, 128, 255), // dodger blue
  color(  0,   0, 255), // blue
  color(128,   0, 255), // purple
  color(255,   0, 255), // violet
  color(255,   0, 128)  // magenta
];

var worldWidth;
var worldHeight;
var cellSize;
var cellSpacing;
setCanvasSize();

var isPaused = false;
var isDrawing = false;
var useRandomColor = true;
var selectedColor = getRandomHue();
var gridColor = color(255, 255, 255);
var touches = new Map();

var universe = [];
for (let x = 0; x < worldWidth; x++)
    universe[x] = [];

document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseout', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchmove', handleTouchMove);

document.body.addEventListener('touchstart', preventDefaultAction, { passive: false });
document.body.addEventListener('touchend', preventDefaultAction, { passive: false });
document.body.addEventListener('touchmove', preventDefaultAction, { passive: false });
document.body.addEventListener('wheel', preventDefaultAction, { passive: false });

setInterval(update, 125)

function update()
{
  if (!isPaused)
    iterate();

  redraw();
}

function iterate()
{
  let next = [];

  for (let x = 0; x < worldWidth; x++)
  {
    next[x] = []
    for (let y = 0; y < worldHeight; y++)
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

  let alive = [];

  for (let x = 0; x < worldWidth; x++)
    for (let y = 0; y < worldHeight; y++)
    {
      let cell = universe[x][y];
      if (cell)
      {
        drawCell(x, y, cell);
        alive.push(cell);
      }
    }

  if (alive.length != 0)
  {
    let r = 0;
    let g = 0;
    let b = 0;

    alive.forEach((cell) => 
    {
      r += cell.r;
      g += cell.g;
      b += cell.b;
    });

    r = Math.floor(r / alive.length);
    g = Math.floor(g / alive.length);
    b = Math.floor(b / alive.length);

    gridColor = color(r, g, b);
  }
  
  context.fillStyle = toHex(gridColor);
  
  for (let x = 1; x < worldWidth; x++)
    for (let y = 1; y < worldHeight; y++)
      context.fillRect(x * cellSize - (cellSpacing/2), 
                       y * cellSize - (cellSpacing/2),
                       cellSpacing,
                       cellSpacing);
}

function getCell(x, y)
{
  let xWrapped = (x + worldWidth) % worldWidth;
  let yWrapped = (y + worldHeight) % worldHeight;
  return universe[xWrapped][yWrapped];
}

function setCell(x, y, c)
{
  universe[x][y] = c;
  drawCell(x, y, c);
}

function drawCell(x, y, c)
{
  context.fillStyle = toHex(c);
  context.fillRect(x * cellSize + (cellSpacing / 2), 
                   y * cellSize + (cellSpacing / 2), 
                   cellSize - cellSpacing,
                   cellSize - cellSpacing);
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
  return blendColors(...neighbors);
}

function color(r, g, b)
{
  return {
    'r': r,
    'g': g,
    'b': b
  };
}

function blendColors(color0, color1, color2)
{
  let r = Math.floor((color0.r + color1.r + color2.r) / 3);
  let g = Math.floor((color0.g + color1.g + color2.g) / 3);
  let b = Math.floor((color0.b + color1.b + color2.b) / 3);

  return color(r, g, b);
}

function getRandomHue()
{
  let index = Math.floor(Math.random() * hues.length);
  return hues[index];
}

function toHex(color) {
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

    case 'KeyX':
      useRandomColor = true;
      return;

    case 'KeyR':
      selectedColor = hues[0];
      break;

    case 'KeyO':
      selectedColor = hues[1];
      break;

    case 'KeyY':
      selectedColor = hues[2];
      break;
    
    case 'KeyH':
      selectedColor = hues[3];
      break;
    
    case 'KeyG':
      selectedColor = hues[4];
      break;

    case 'KeyS':
      selectedColor = hues[5];
      break;

    case 'KeyC':
      selectedColor = hues[6];
      break;

    case 'KeyD':
      selectedColor = hues[7];
      break;

    case 'KeyB':
      selectedColor = hues[8];
      break;

    case 'KeyP':
      selectedColor = hues[9];
      break;

    case 'KeyV':
      selectedColor = hues[10];
      break;

    case 'KeyM':
      selectedColor = hues[11];
      break;

    case 'KeyK':
      selectedColor = color(  0,   0,   0);
      break;

    case 'KeyW':
      selectedColor = color(255, 255, 255);
      break;

    default:
      return;
  }

  useRandomColor = false;
}

function handleMouseDown(event)
{
  isDrawing = true;
  if (useRandomColor)
    selectedColor = getRandomHue();
  
  let bounds = canvas.getBoundingClientRect();
  let x = Math.floor((event.clientX - bounds.left) / cellSize);
  let y = Math.floor((event.clientY - bounds.top) / cellSize);

  setCell(x, y, selectedColor);
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
  let x = Math.floor((event.clientX - bounds.left) / cellSize);
  let y = Math.floor((event.clientY - bounds.top) / cellSize);

  setCell(x, y, selectedColor);
}

function handleTouchStart(event)
{
  let bounds = canvas.getBoundingClientRect();

  for (let i = 0; i < event.changedTouches.length; i++)
  {
    let touch = event.changedTouches.item(i);
    let color = useRandomColor
              ? getRandomHue()
              : selectedColor;
    touches.set(touch.identifier, color);

    let x = Math.floor((touch.clientX - bounds.left) / cellSize);
    let y = Math.floor((touch.clientY - bounds.top) / cellSize);
    setCell(x, y, color);  
  }
}

function handleTouchEnd(event)
{
  for (let i = 0; i < event.changedTouches.length; i++)
    touches.delete(event.changedTouches.item(i).identifier);
}

function handleTouchMove(event)
{
  let bounds = canvas.getBoundingClientRect();

  for (let i = 0; i < event.changedTouches.length; i++)
  {
    let touch = event.changedTouches.item(i);
    let color = touches.get(touch.identifier);

    let x = Math.floor((touch.clientX - bounds.left) / cellSize);
    let y = Math.floor((touch.clientY - bounds.top) / cellSize);
    setCell(x, y, color);  
  }
}

function setCanvasSize() {
  let userAgent = navigator.userAgent;
  let isMobile =
    /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
    /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);

  let minimumDimension = isMobile ? 25 : 50;
  let ratio = window.innerWidth / window.innerHeight;
  
  if (ratio > 1)
  {
    worldWidth = Math.floor(ratio * minimumDimension);
    worldHeight = minimumDimension;
  }
  else
  {
    worldWidth = minimumDimension;
    worldHeight = Math.floor((1 / ratio) * minimumDimension);
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  cellSize = canvas.width / worldWidth;
  cellSpacing = cellSize / 10;
}

function preventDefaultAction(event)
{
  if (event.target == canvas)
    event.preventDefault();
}