/*
 * Global variables
 */

// A reference to the canvas element in the DOM
let canvas;

// The rendering context used for drawing to the canvas
let context;

// The QuadTree structure
let quadTree;

// An array of all particles present
let particles;

// The coordinates of the cursor
let mouse = { x: 0, y: 0 };

// The distance around the cursor for which particles will be highlighted a different color
let mouseRadius = 50;



/*
 * Represents a 2D point that moves with a velocity
 */
class Particle {

  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Start with a random velocity in range [-1, 1]
    this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
  }

  update() {
    // Move the particle by it's velocity and wrap it when it does off-screen
    this.x = (this.x + this.velocity.x + canvas.width ) % canvas.width;
    this.y = (this.y + this.velocity.y + canvas.height) % canvas.height;
  }

}



/*
 * Initialize the demo
 */
function init() {

  // Grab a canvas from the DOM
  canvas = document.getElementsByTagName('canvas')[0];

  // Display an error if no canvas was found
  if (!canvas) console.error('Canvas element not found!');

  // Get a rendering context from the canvas
  context = canvas.getContext('2d');

  // Update the stored mouse coordinates when the mouse moves over the canvas
  canvas.addEventListener('mousemove', ev => {
    const bounds = canvas.getBoundingClientRect();
    mouse.x = ev.clientX - bounds.left;
    mouse.y = ev.clientY - bounds.top;
  });

  // Create a new QuadTree
  quadTree = new QuadTree(
    10, // Maximum permitted subdivisions
    100, // Maximum items in the same bin before subdividing said bin
    new Rect(0, 0, canvas.width, canvas.height) // The extent/domain of the QuadTree
  );

  // Create
  particles = [];
  for (let i = 10000; i--;) {
    const particle = new Particle(Math.random() * canvas.width, Math.random() * canvas.height);
    particles.push(particle);
    quadTree.addItem(particle.x, particle.y, particle);
  }

  // Start the drawing loop
  render();
}



/*
 * Render a frame
 */
function render() {

  // Clear and rebuild the quadtree and move all the particles
  quadTree.clear();
  for (let particle of particles) {
    particle.update();
    quadTree.addItem(particle.x, particle.y, particle);
  }

  // Clear the canvas
  context.fillStyle = '#222';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw all the particles
  context.beginPath();
  for (let particle of particles) {
    context.moveTo(particle.x, particle.y);
    context.arc(particle.x, particle.y, 1, 0, 2 * Math.PI);
  }
  context.fillStyle = '#fff';
  context.fill();

  // Render the subdivisions of the QuadTree
  quadTree.debugRender(context);

  // Render a red circle around the cursor
  context.beginPath();
  context.arc(mouse.x, mouse.y, mouseRadius, 0, 2 * Math.PI);
  context.strokeStyle = '#f00';
  context.stroke();

  // Highlight the particles within a radius around the cursor
  let closeAgents = quadTree.getItemsInRadius(mouse.x, mouse.y, mouseRadius);
  context.beginPath();
  for (let particle of closeAgents) {
    context.moveTo(particle.x, particle.y);
    context.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
  }
  context.fillStyle = '#f00';
  context.fill();

  // Schedule drawing another frame at the next refresh of the monitor
  requestAnimationFrame(render);
}



// Start the demo once the page is ready
document.addEventListener('DOMContentLoaded', init);