export class Color
{
  constructor(red, green, blue)
  {
    this.r = red;
    this.g = green;
    this.b = blue;
  }

  static blend(...colors)
  {
    let r = 0;
    let g = 0;
    let b = 0;

    colors.forEach((color) => 
    {
      r += color.r;
      g += color.g;
      b += color.b;
    });

    return new Color(
      Math.floor(r / colors.length),
      Math.floor(g / colors.length),
      Math.floor(b / colors.length)
    );
  }

  static random()
  {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);

    return new Color(r, g, b);
  }

  toHex()
  {
    const componentToHex = (component) => 
    {
      let hex = component.toString(16);
      return (hex.length === 1) ? '0' + hex : hex;
    };

    return '#' + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
  }
}