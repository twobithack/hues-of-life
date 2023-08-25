import { Color } from './color.js';
import { Universe } from './universe.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const universe = new Universe(...calculateDimensions(), Color.blend);
const cellSize = canvas.width / universe.width;
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
    universe.iterate();

  redraw();
}

function redraw()
{
  blankCanvas();

  let living = [];
  for (let x = 0; x < universe.width; x++)
    for (let y = 0; y < universe.height; y++)
    {
      let cell = universe.get(x, y);
      if (cell)
      {
        drawCell(x, y, cell);
        living.push(cell);
      }
    }

  if (living.length != 0)
  gridColor = Color.blend(living);

  drawGrid();
}

function blankCanvas()
{
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid()
{
  
  context.fillStyle = gridColor.toHex();
  for (let x = 1; x < universe.width; x++)
    for (let y = 1; y < universe.height; y++)
      context.fillRect(x * cellSize - (cellSpacing/2), 
                       y * cellSize - (cellSpacing/2),
                       cellSpacing,
                       cellSpacing);
}

function drawCell(x, y, color)
{
  context.fillStyle = color.toHex();
  context.fillRect(x * cellSize + (cellSpacing / 2), 
                   y * cellSize + (cellSpacing / 2), 
                   cellSize - cellSpacing,
                   cellSize - cellSpacing);
}

function setCell(x, y, color)
{
  universe.set(x, y, color);
  drawCell(x, y, color);
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

    case 'KeyR':  selectedColor = Color.red;          break;
    case 'KeyO':  selectedColor = Color.orange;       break;
    case 'KeyY':  selectedColor = Color.yellow;       break;
    case 'KeyH':  selectedColor = Color.chartreuse;   break;
    case 'KeyG':  selectedColor = Color.green;        break;
    case 'KeyS':  selectedColor = Color.spring_green; break;
    case 'KeyC':  selectedColor = Color.cyan;         break;
    case 'KeyD':  selectedColor = Color.dodger_blue;  break;
    case 'KeyB':  selectedColor = Color.blue;         break;
    case 'KeyP':  selectedColor = Color.purple;       break;
    case 'KeyV':  selectedColor = Color.violet;       break;
    case 'KeyM':  selectedColor = Color.magenta;      break;
    case 'KeyK':  selectedColor = Color.black;        break;
    case 'KeyW':  selectedColor = Color.white;        break;

    default:
      return;
  }

  useRandomColor = false;
}

function handleMouseDown(event)
{
  isDrawing = true;
  if (useRandomColor)
    selectedColor = Color.randomHue();
  
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
              ? Color.randomHue()
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

function isMobile() {
  const userAgent = navigator.userAgent;
  return (
    /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
    /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent)
  );
}

function calculateDimensions()
{
  let width, heigth;
  let minimumDimension = isMobile() ? 25 : 50;
  let ratio = window.innerWidth / window.innerHeight;

  if (ratio > 1)
  {
    width = Math.floor(ratio * minimumDimension);
    heigth = minimumDimension;
  }
  else
  {
    width = minimumDimension;
    heigth = Math.floor((1 / ratio) * minimumDimension);
  }

  return [width, heigth];
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

  let options = { passive: false };
  document.body.addEventListener('touchstart',  preventDefaultAction, options);
  document.body.addEventListener('touchend',    preventDefaultAction, options);
  document.body.addEventListener('touchmove',   preventDefaultAction, options);
  document.body.addEventListener('wheel',       preventDefaultAction, options);
}

function preventDefaultAction(event)
{
  if (event.target == canvas)
    event.preventDefault();
}