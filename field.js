//Code for the grid adapted from Daniel Schiffman's Perlin Noise Flow Field example at
//https://www.youtube.com/watch?v=BjoM9oKOAKY

//Vector field equations from
//http://tutorial.math.lamar.edu/Classes/CalcIII/VectorFields.aspx
//(and a bit of experimenting)

//Particle code adapted from Paper.js references
//http://paperjs.org/examples/tadpoles/
//http://paperjs.org/examples/chain/

paper.settings.applyMatrix = false;

var particleNumber = 80;
var scl = 35;
var lineLength = 6;
var vectorArray = [];
var lineGroup = [];
var particles = [];
var count = 1;
var cols = Math.floor(paper.view.size.width/scl) +1;
var rows = Math.floor(paper.view.size.height/scl) +1;

var Particle = Base.extend({
  initialize: function(position, maxSpeed) {
    var strength = Math.random() * 0.5;
    this.position = position.clone();
    this.vector = Point.random() * 2 - 1;
    this.acceleration = new Point();
    this.maxSpeed = maxSpeed + strength;
    this.createBody();
  },

  run: function() {
    this.follow();
    this.move();
    this.edges();
  },

  createBody: function() {
    this.body = new Path({
      strokeColor: 'white',
      strokeWidth: 2,
      strokeCap: 'round'
    })

    for (var i = 0; i < 6; i++) {
    	this.body.add(this.position + new Point(i * length, 0));
    }

  },

  follow: function() {
    var x = Math.floor(this.position.x / scl);
    var y = Math.floor(this.position.y / scl);
    var index = x + y * cols;
    var force = vectorArray[index];
    this.applyForce(force);
  },

  applyForce: function(force) {
    this.vector += force;
    this.vector.length = Math.min(this.maxSpeed, this.vector.length);
    this.position += this.vector;
  },

  move: function() {
    this.body.firstSegment.point = this.position;
    for (var i = 0; i < 5; i++) {
      var segment = this.body.segments[i];
      var nextSegment = segment.next;
      var vector = segment.point - nextSegment.point;
      vector.length = 4;
      nextSegment.point = segment.point - vector;
    }
    this.body.smooth({ type: 'continuous' });
	},

  edges: function() {
    if (this.position.x > paper.view.size.width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = paper.view.size.width;
    if (this.position.y > paper.view.size.height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = paper.view.size.height;
  }

});

function animate() {
  for (var i = 0, l = particles.length; i < l; i++) {
    particles[i].run();
  }
}

function calcVec(val, x,y) {
  var vec;
  switch( val ) {
    case 1:
      vec = new Point(2*x, 2*y);
      break;
    case 2:
      vec = new Point(- 2*x, - 2*y);
      break;
    case 3:
      vec = new Point(-y, x);
      break;
    case 4:
      vec = new Point(y, -x);
      break;
    case 5:
      vec = new Point(4*x, y);
      break;
    case 6:
      vec = new Point(y + x, - x + y);
      break;
    case 7:
      vec = new Point(y^2 - 4*y, x^2 - 4*x);
      break;
    default:
      vec = new Point(y - x, - x - y);
  }
  return vec;
}

function createGrid(option) {

  if (lineGroup.length > 0) {
    for (var i = 0; i < lineGroup.length; i++) {
     lineGroup[i].remove();
    }
  }

  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var p = new Point((x * scl)+((scl/2)-(lineLength/2)), (y * scl)+((scl/2)-(lineLength/2)));
      var p2 = new Point((p.x + 6), p.y);
      var line = new Path(p,p2);
      var h = calcVec(option, p.x - paper.view.center.x, p.y - paper.view.center.y);
      line.style = {strokeColor: 'white', strokeWidth: 1};
      line.rotate(h.angle);
      vectorArray[index] = h;
      lineGroup.push(line);
    }
  }
}

function initialize() {

  createGrid();
  for (var i = 0; i < particleNumber; i++) {
    particles.push(new Particle(new Point(paper.view.size.width, paper.view.size.height) * Point.random(), 1));
  }
  paper.view.attach('frame', animate);

}

function onMouseDown(event) {
  if (count > 7) { count = 1 }
  createGrid(count);
  count++
}

initialize();
