import { Color } from './color.js';
import { Life } from './life.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const eventListeners = [
  { target: document, event: 'keydown',     handler: handleKeyPress },
  { target: canvas,   event: 'mousedown',   handler: handleMouseDown },
  { target: canvas,   event: 'mouseup',     handler: handleMouseUp },
  { target: canvas,   event: 'mouseout',    handler: handleMouseUp },
  { target: canvas,   event: 'mousemove',   handler: handleMouseMove },
  { target: canvas,   event: 'touchstart',  handler: handleTouchStart },
  { target: canvas,   event: 'touchmove',   handler: handleTouchMove },
  { target: canvas,   event: 'touchend',    handler: handleTouchEnd },
  { target: window,   event: 'resize',      handler: handleResize },
];

const suppressedListeners = [
  { target: document.body, event: 'touchstart' },
  { target: document.body, event: 'touchmove' },
  { target: document.body, event: 'touchend' },
  { target: document.body, event: 'wheel' }
];

const game = new Life(getDimensions(), Color.blend);
const cellSize = canvas.width / game.width;
const cellSpacing = cellSize / 10;

var displayColumns = Math.ceil(canvas.width / cellSize);
var displayRows = Math.ceil(canvas.height / cellSize);

var isPaused = false;
var isDrawing = false;
var useRandomColor = true;
var selectedColor = Color.randomHue();
var gridColor = new Color(255, 255, 255);
var touches = new Map();

attachEventListeners();
setInterval(update, 125);

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
  for (let x = 0; x < displayColumns; x++)
    for (let y = 0; y < displayRows; y++)
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
  for (let x = 1; x < displayColumns; x++)
    for (let y = 1; y < displayRows; y++)
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

    case 'KeyF':
      requestFullscreen();
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

  suppressDefault(event);
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
  requestFullscreen();

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

function handleResize(event)
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  displayColumns = Math.ceil(canvas.width / cellSize);
  displayRows = Math.ceil(canvas.height / cellSize);

  detachEventListeners();
  attachEventListeners();
  redraw();
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
  eventListeners.forEach(({ target, event, handler }) => {
    target.addEventListener(event, handler);
  });

  suppressedListeners.forEach(({ target, event }) => {
    target.addEventListener(event, suppressDefault, { passive: false });
  });
}

function detachEventListeners()
{
  eventListeners.forEach(({ target, event, handler }) => {
    target.removeEventListener(event, handler);
  });

  suppressedListeners.forEach(({ target, event }) => {
    target.removeEventListener(event, suppressDefault);
  });
}

function suppressDefault(event)
{
  if (event.target == canvas)
    event.preventDefault();
}

function isFullscreen() {
  return !!(
    document.fullscreenElement        ||
    document.webkitFullscreenElement  ||
    document.mozFullScreenElement     ||
    document.msFullscreenElement             
  );
}

function requestFullscreen()
{
  if (isFullscreen())
    return;

  if (canvas.requestFullscreen)
    canvas.requestFullscreen();
  else if (canvas.webkitRequestFullscreen)
    canvas.webkitRequestFullscreen();
  else if (canvas.mozRequestFullScreen)
    canvas.mozRequestFullScreen();
  else if (canvas.msRequestFullscreen)
    canvas.msRequestFullscreen();
}