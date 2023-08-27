import { Color } from './color.js';
import { Life } from './life.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Life(getDimensions(), Color.blend);
const cellSize = canvas.width / game.width;
const cellSpacing = cellSize / 10;

var isPaused = false;
var isDrawing = false;
var useRandomColor = true;
var selectedColor = Color.randomHue();
var gridColor = new Color(255, 255, 255);
var touches = new Map();

attachEventListeners();
setInterval(update, 125)

function update()
{
  if (!isPaused)
    game.iterate();

  redraw();
}

function redraw()
{
  blankCanvas();

  const living = [];
  for (let x = 0; x < game.width; x++)
    for (let y = 0; y < game.height; y++)
    {
      const cell = game.get(x, y);
      if (cell)
      {
        drawCell(x, y, cell);
        living.push(cell);
      }
    }

  if (living.length != 0)
    gridColor = Color.blend(living);

  drawDots();
}

function blankCanvas()
{
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCell(x, y, color)
{
  context.fillStyle = color.toHex();
  context.fillRect(x * cellSize + (cellSpacing / 2), 
                   y * cellSize + (cellSpacing / 2), 
                   cellSize - cellSpacing,
                   cellSize - cellSpacing);
}

function drawDots()
{
  context.fillStyle = gridColor.toHex();
  for (let x = 1; x < game.width; x++)
    for (let y = 1; y < game.height; y++)
      context.fillRect(x * cellSize - (cellSpacing/2), 
                       y * cellSize - (cellSpacing/2),
                       cellSpacing,
                       cellSpacing);
}

function setCell(x, y, color)
{
  game.set(x, y, color);
  drawCell(x, y, color);
}

function handleKeyPress(event)
{
  const colorMap = 
  {
    KeyR: Color.red,         
    KeyO: Color.orange,
    KeyY: Color.yellow,
    KeyH: Color.chartreuse,
    KeyG: Color.green,       
    KeyS: Color.spring_green,
    KeyC: Color.cyan,        
    KeyD: Color.dodger_blue, 
    KeyB: Color.blue,        
    KeyP: Color.purple,      
    KeyV: Color.violet,      
    KeyM: Color.magenta,     
    KeyK: Color.black,       
    KeyW: Color.white
  };

  switch (event.code)
  {
    case 'Space':
      isPaused = !isPaused;
      return;

    case 'KeyX':
      useRandomColor = true;
      return;

    default:
      if (event.code in colorMap)
      {
        selectedColor = colorMap[event.code];
        useRandomColor = false;
      }
      return;
  }
}

function handleMouseDown(event)
{
  isDrawing = true;
  if (useRandomColor)
    selectedColor = Color.randomHue();
  
  const bounds = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - bounds.left) / cellSize);
  const y = Math.floor((event.clientY - bounds.top) / cellSize);

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
  
  const bounds = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - bounds.left) / cellSize);
  const y = Math.floor((event.clientY - bounds.top) / cellSize);

  setCell(x, y, selectedColor);
}

function handleTouchStart(event)
{
  const bounds = canvas.getBoundingClientRect();
  for (let i = 0; i < event.changedTouches.length; i++)
  {
    const touch = event.changedTouches.item(i);
    const x = Math.floor((touch.clientX - bounds.left) / cellSize);
    const y = Math.floor((touch.clientY - bounds.top) / cellSize);
    const color = useRandomColor
                ? Color.randomHue()
                : selectedColor;

    touches.set(touch.identifier, color);
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
  const bounds = canvas.getBoundingClientRect();
  for (let i = 0; i < event.changedTouches.length; i++)
  {
    const touch = event.changedTouches.item(i);
    const x = Math.floor((touch.clientX - bounds.left) / cellSize);
    const y = Math.floor((touch.clientY - bounds.top) / cellSize);
    const color = touches.get(touch.identifier);

    setCell(x, y, color);  
  }
}

function getDimensions()
{
  const userAgent = navigator.userAgent;
  const isMobile = 
    /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
    /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);

  const minimumDimension = isMobile ? 20 : 40;
  const ratio = window.innerWidth / window.innerHeight;
  const dimensions = {};

  if (ratio > 1)
  {
    dimensions.width = Math.floor(ratio * minimumDimension);
    dimensions.height = minimumDimension;
  }
  else
  {
    dimensions.width = minimumDimension;
    dimensions.height = Math.floor((1 / ratio) * minimumDimension);
  }

  return dimensions;
}

function attachEventListeners()
{
  document.addEventListener('keydown',  handleKeyPress);
  canvas.addEventListener('mousedown',  handleMouseDown);
  canvas.addEventListener('mouseup',    handleMouseUp);
  canvas.addEventListener('mouseout',   handleMouseUp);
  canvas.addEventListener('mousemove',  handleMouseMove);
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchend',   handleTouchEnd);
  canvas.addEventListener('touchmove',  handleTouchMove);

  const options = { passive: false };
  document.body.addEventListener('touchstart',  suppressDefault, options);
  document.body.addEventListener('touchend',    suppressDefault, options);
  document.body.addEventListener('touchmove',   suppressDefault, options);
  document.body.addEventListener('wheel',       suppressDefault, options);
}

function suppressDefault(event)
{
  if (event.target == canvas)
    event.preventDefault();
}