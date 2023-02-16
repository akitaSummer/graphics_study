import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

// 矩形
const rectangle = new PIXI.Graphics();
rectangle.beginFill(0x66ccff, 0.9);
rectangle.lineStyle(4, 0xff0000, 1); // line 在 draw前
rectangle.drawRect(200, 200, 164, 64);
rectangle.endFill();

rectangle.scale.set(2, 2);
rectangle.position.set(100, 100);
rectangle.rotation = 0.5;
// 设置图形原点
rectangle.pivot.set(82, 32);
app.stage.addChild(rectangle);

// 圆形
const circle = new PIXI.Graphics();
circle.beginFill(0x65ccff, 0.8);
circle.drawCircle(0, 0, 32);
circle.endFill();
circle.position.set(300, 300);
app.stage.addChild(circle);

// 圆角矩形
const roundedRect = new PIXI.Graphics();
roundedRect.beginFill(0x36acff, 0.9);
roundedRect.drawRoundedRect(0, 0, 164, 64, 10);
roundedRect.endFill();
roundedRect.position.set(500, 500);
app.stage.addChild(roundedRect);

// 椭圆
const ellipse = new PIXI.Graphics();
ellipse.beginFill(0x36acff, 0.9);
ellipse.drawEllipse(0, 0, 164, 64);
ellipse.endFill();
ellipse.position.set(700, 700);
app.stage.addChild(ellipse);

// 多边形
const polygon = new PIXI.Graphics();
polygon.beginFill(0x43ff23, 0.5);
polygon.drawPolygon([0, 0, 100, 0, 100, 100, 0, 100]);
polygon.endFill();
polygon.position.set(50, 300);
app.stage.addChild(polygon);

// 圆弧
const arc = new PIXI.Graphics();
arc.beginFill(0x660000, 0.9);
// x, y, 半径, 起始角度, 结束角度, 是否逆时针
arc.arc(0, 0, 32, 0, Math.PI, false);
arc.endFill();
arc.position.set(300, 50);
app.stage.addChild(arc);

// 线段
const line = new PIXI.Graphics();
line.lineStyle(4, 0xff0000, 1);
line.moveTo(0, 0);
line.lineTo(100, 100);
line.lineTo(200, 0);
line.position.set(500, 50);
app.stage.addChild(line);
