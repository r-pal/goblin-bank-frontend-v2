import { ReactP5Wrapper, type Sketch } from "@p5-wrapper/react";

const sketch: Sketch = (p) => {
  let x = 0;
  let y = 0;
  let vx = 0.35;
  let vy = 0.22;
  let hue = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    x = p.width * 0.4;
    y = p.height * 0.4;
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    hue = (hue + 0.12) % 360;
    p.background(p.color(hue, 30, 12, 100));

    x += vx;
    y += vy;
    if (x < 60 || x > p.width - 60) vx *= -1;
    if (y < 60 || y > p.height - 60) vy *= -1;

    p.noStroke();
    p.fill((hue + 140) % 360, 70, 85, 24);
    p.ellipse(x, y, 180, 140);

    p.fill((hue + 40) % 360, 80, 90, 18);
    p.ellipse(x + 80, y - 60, 120, 96);
  };
};

export function OfficeLoginP5() {
  return <ReactP5Wrapper sketch={sketch} />;
}

