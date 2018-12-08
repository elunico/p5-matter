// Daniel Shiffman
// Matter.js + p5.js Examples
// This example is based on examples from: http://brm.io/matter-js/

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;

let Mouse = Matter.Mouse;
let MouseConstraint = Matter.MouseConstraint;

let engine;
let world;
let bodies;

let canvas;
let constraint;

let mouseConstraint;

let gravitySlider;
let gravityP;

let toggleButton;

let looping = true;

function toggleState() {
  if (looping) {
    noLoop();
    looping = false;
  } else {
    loop();
    looping = true;
  }
};

function keyPressed() {
  if (key == ' ')
    toggleState();
}

function setup() {
  canvas = createCanvas(800, 600);
  createP('');
  gravitySlider = createSlider(-4, 4, 1, 0.05);
  gravitySlider.style('width', '800px');
  gravitySlider.input(() => {
    gravityP.html('Gravity = ' + parseFloat(gravitySlider.value()));
  });
  gravityP = createP('Gravity = ' + gravitySlider.value());
  toggleButton = createButton('Toggle Simulation');
  toggleButton.mousePressed(toggleState);


  // create an engine
  engine = Engine.create();
  world = engine.world;

  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse: mouse,
    constraint: {
      stiffness: 0.1,
    }
  }
  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(world, mouseConstraint);


  var group = Body.nextGroup(true);


  // Make a single rectangle
  function makeRect(x, y) {
    var params = {
      collisionFilter: {
        group: group
      }
    }
    var body = Bodies.rectangle(x, y, 50, 20, params);
    // adding properties that I can pick up later
    body.w = 50;
    body.h = 20;
    return body;
  }

  // Create a stack of rectangles
  // x, y, columns, rows, column gap, row gap
  var ropeA = Composites.stack(width / 2, 100, 1, 9, 0, 25, makeRect);
  bodies = ropeA.bodies;

  // Connect them as a chain
  var params = {
    stiffness: 0.8,
    length: 2
  }
  Composites.chain(ropeA, 0.5, 0, -0.5, 0, params);

  var params = {
    bodyB: ropeA.bodies[0],
    pointB: {
      x: -25,
      y: 0
    },
    pointA: {
      x: width / 2,
      y: 100
    },
    stiffness: 0.5
  };

  constraint = Constraint.create(params);
  Composite.add(ropeA, constraint);

  // add all of the bodies to the world
  World.add(world, ropeA);

  // run the engine
  // Engine.run(engine);
  // Update engine in draw so it halts
}

function draw() {
  background(51);
  stroke(255);
  strokeWeight(1);
  fill(255, 50);
  engine.world.gravity.y = parseFloat(gravitySlider.value());
  for (var i = 0; i < bodies.length; i++) {
    var circle = bodies[i];
    var pos = circle.position;
    var r = circle.circleRadius;
    var angle = circle.angle;
    push();
    translate(pos.x, pos.y);
    rectMode(CENTER);
    rotate(angle);
    rect(0, 0, 50, 20);
    line(0, 0, 25, 0);
    pop();
  }

  var a = constraint.pointA;
  var b = constraint.pointB;
  var pos = constraint.bodyB.position;
  stroke(255);
  fill(255);
  line(a.x, a.y, pos.x + b.x, pos.y + b.y);
  ellipse(a.x, a.y, 4, 4);
  ellipse(pos.x + b.x, pos.y + b.y, 4, 4);

  var a = mouseConstraint.constraint.pointA;
  var b = mouseConstraint.constraint.pointB;
  var bodyB = mouseConstraint.constraint.bodyB;
  if (bodyB) {
    stroke(255);
    line(a.x, a.y, b.x + bodyB.position.x, b.y + bodyB.position.y);
  }
  Engine.update(engine);
}