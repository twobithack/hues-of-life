export class Color
{
  static black        = new Color(  0,   0,   0);
  static red          = new Color(255,   0,   0);
  static orange       = new Color(255, 128,   0);
  static yellow       = new Color(255, 255,   0);
  static chartreuse   = new Color(128, 255,   0);
  static green        = new Color(  0, 255,   0);
  static spring_green = new Color(  0, 255, 128);
  static cyan         = new Color(  0, 255, 255);
  static dodger_blue  = new Color(  0, 128, 255);
  static blue         = new Color(  0,   0, 255);
  static purple       = new Color(128,   0, 255);
  static violet       = new Color(255,   0, 255);
  static magenta      = new Color(255,   0, 128);
  static white        = new Color(255, 255, 255);

  constructor(r, g, b)
  {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static blend(colors)
  {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    colors.forEach((color) => 
    {
      rSum += color.r;
      gSum += color.g;
      bSum += color.b;
    });

    return new Color(
      Math.floor(rSum / colors.length),
      Math.floor(gSum / colors.length),
      Math.floor(bSum / colors.length)
    );
  }

  static random()
  {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return new Color(r, g, b);
  }

  static randomHue()
  {
    const hues = [
      this.red,
      this.orange,
      this.yellow,
      this.chartreuse,
      this.green,
      this.spring_green,
      this.cyan,
      this.dodger_blue,
      this.blue,
      this.purple,
      this.violet,
      this.magenta     
    ];

    const index = Math.floor(Math.random() * hues.length);
    return hues[index];
  }

  toHex()
  {
    const componentToHex = (component) => 
    {
      const hex = component.toString(16);
      return (hex.length === 1) ? '0' + hex : hex;
    };

    return '#' + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
  }
}