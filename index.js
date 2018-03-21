let rockets;
let n = 20;
let lifespan = 300;
let counter = 0;
let counterDisplay;
let score = 0;
let scoreDisplay;
let target;
let population;

function createRockets() {
  rockets = new Array(n).fill().map(() => {
    return new Rocket(createVector(width/2, height), createVector(), createVector());
  });
}

function setup() {
  createCanvas(800, 600);
  population = new Array(n).fill().map(() => new Dna());
  createRockets();
  counterDisplay = createP(counter);
  scoreDisplay = createP(score);
  target = createVector(width / 2, 100);
}

function draw() {
  background(0);
  ellipse(target.x, target.y, 20, 20);
  rockets.forEach((rocket, idx) => {
    let dna = population[idx]
    rocket.acc = dna.genes[counter].acc;
    rocket.draw();
    rocket.update();
    dna.fitness = -target.dist(rocket.pos);
  });
  counter++;
  if (counter >= lifespan) {
    createRockets();
    population = generateNewPopulation(population);
    counter = 0;
    score = 0;
  }
  counterDisplay.html(counter);
  scoreDisplay.html(score);
}

// Classes

function Rocket(pos, vel, acc) {
  this.pos = pos;
  this.vel = vel;
  this.acc = acc;
}

Rocket.prototype.draw = function() {
  push();
  translate(this.pos.x, this.pos.y);
  rotate(this.vel.heading());
  triangle(0, -10, 0, 10, 30, 0);
  pop();
}

Rocket.prototype.update = function() {
  if (this.pos.dist(target) > 30) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc = createVector();
  } else {
    score += 1;
  }
}

// GA

let UNIFORM_RATE = 0.4;
let SELECTION_RATE = 0.5;
let MUTATION_RATE = 0.06;

function Gene() {
  this.acc = p5.Vector.random2D().mult(0.5);
}

Gene.prototype.mutate = function() {
  return (random() <= MUTATION_RATE) ? new Gene() : this;
}

function Dna(genes) {
  this.genes = genes ? genes : new Array(lifespan).fill().map(() => new Gene());
  this.fitness = -5000;
}

Dna.prototype.crossover = function(partner) {
  return new Dna(this.genes.map((gene, idx) => (random() <= UNIFORM_RATE) ? gene.mutate() : partner.genes[idx].mutate()));
}

function geneSelect(arr) {
  let len = arr.length;
  arr.forEach((gene, idx) => {
    if (random() <= (SELECTION_RATE * (len - idx) / len)) {
      return gene;
    }
  });
  return arr[0];
}

function generateNewPopulation(arr) {
  let ordered = arr.sort((a, b) => {
    if (a.fitness > b.fitness) {
      return -1;
    }
    if (b.fitness > a.fitness) {
      return 1;
    }
    return 0;
  });


  return new Array(n).fill().map(() => {
    let p1 = geneSelect(ordered);
    let p2 = geneSelect(ordered);
    return p1.crossover(p2);
  });
}
