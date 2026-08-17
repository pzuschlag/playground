'use strict';

// Initialise an empty canvas and place it on the page
var _canvas = document.createElement("canvas");
var _context = _canvas.getContext("2d");
_canvas.width = 800;
_canvas.height = 500;

//Liste allen Intervallen
var refreshIntervalIds = [];

window.onload = function () {
    document.body.appendChild(_canvas);
    // Fill the canvas with a black background to show where it is

    _context.fillRect(0, 0, _canvas.width, _canvas.height);
};

// Draw a square particle on the canvas
function drawSquareParticle() {
    _context.fillStyle = "white";
    _context.fillRect(300, 200, 10, 10);
}

// Draw a circle particle on the canvas
function drawCircleParticle() {
    _context.beginPath();
    _context.fillStyle = "white";
    // After setting the fill style, draw an arc on the canvas
    _context.arc(500, 200, 10, 0, Math.PI * 2, true);
    _context.closePath();
    _context.fill();
}

//Movement
function moveParticle() {
    
    //Erease the screen an kill all intervalls
    erease();

    // Initial positon
    var posX = 20,
        posY = 100;

    // Draw shapes on the canvas using an interval of 30ms
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "black";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        posX += 1;
        posY += 0.25;

        // Draw a circle particle on the canvas
        _context.beginPath();
        _context.fillStyle = "white";
        // After setting the fill style, draw an arc on the canvas
        _context.arc(posX, posY, 10, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }, 30));
}

//Physics & randomness
function moveParticle2() {

    //Erease the canvas an kill all intervalls run before
    erease();

    // Initial positon
    var posX = 20,
        posY = _canvas.height / 2;

    // Initial velocities
    var vx = 10,
        vy = -10,
        gravity = 1;

    // Draw shapes on the canvas using an interval of 30ms
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "black";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        // Move position
        posX += vx;
        posY += vy;
        vy += gravity;

        // Draw a circle particle on the canvas
        _context.beginPath();
        _context.fillStyle = "white";
        // After setting the fill style, draw an arc on the canvas
        _context.arc(posX, posY, 10, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }, 30));
}

//Bouncing
function bouncing() {

    //Erease the canvas an kill all intervalls run before
    erease();

    // Initial positon
    var posX = 20,
        posY = _canvas.height / 2;

    // Initial velocities
    var vx = 10,
        vy = -10,
        gravity = 1;

    // Draw shapes on the canvas using an interval of 30ms
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "black";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        //Move position
        posX += vx;
        posY += vy;
        
        if (posY > _canvas.height * 0.75) {
            vy *= -0.6;
            vx *= 0.75;
            posY = _canvas.height * 0.75;
        }

        vy += gravity;

        // Draw a circle particle on the canvas
        _context.beginPath();
        _context.fillStyle = "white";
        // After setting the fill style, draw an arc on the canvas
        _context.arc(posX, posY, 10, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }, 30));
}

//Generating some particles
function generateParticles() {
    
    //Erease the canvas an kill all intervalls run before
    erease();

    var particles = {},
        particleIndex = 0;
    
    //Settings
    var settings = {
            density: 20,
            particleSize: 10,
            startingX: _canvas.width / 2,
            startingY: _canvas.height / 4,
            gravity: 0.5,
            maxLife: 100
        };

    //the particle
    function Particle() {
        // Establish starting positions and velocities
        this.x = settings.startingX;
        this.y = settings.startingY;

        // Random X and Y velocities
        this.vx = Math.random() * 20 - 10; //min: -10; max: 10;
        this.vy = Math.random() * 20 - 5;  //min: -5; max 15;

        // Add new particle to the index
        particleIndex++;
        particles[particleIndex] = this;
        this.id = particleIndex;
        this.life = 0;
    }

    //Drawing the particle
    Particle.prototype.draw = function () {
        this.x += this.vx;
        this.y += this.vy;

        // Adjust for gravity
        this.vy += settings.gravity;

        // Age the particle
        this.life++;

        // If Particle is old, remove it
        if (this.life >= settings.maxLife) {
            delete particles[this.id];
        }

        // Create the shapes
        _context.beginPath();
        _context.fillStyle = "#fff";
        _context.arc(this.x, this.y, settings.particleSize, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }

    //Interval for animating
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "rgba(10,10,10,0.8)";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        // Draw the particles
        for (var i = 0; i < settings.density; i++) {
            if (Math.random() > 0.97) {
                // Introducing a random chance of creating a particle
                // corresponding to an chance of 1 per second,
                // per "density" value
                new Particle();
            }
        }

        for (var pi in particles) {
            particles[pi].draw();
        }
    }, 30));
}

//Generating some particles with walls
function generateParticlesWithWalls() {

    //Erease the canvas an kill all intervalls run before
    erease();

    var particles = {},
        particleIndex = 0;

    //Settings
    var settings = {
        density: 20,
        particleSize: 5,
        particleColor: "#0000ff",
        startingX: _canvas.width / 2,
        startingY: _canvas.height / 4,
        gravity: 0.5,
        maxLife: 150,
        groundLevel: _canvas.height,
        leftWall: _canvas.width * 0.25,
        rightWall: _canvas.width * 0.75
    };

    //the particle
    function Particle() {
        // Establish starting positions and velocities
        this.x = settings.startingX;
        this.y = settings.startingY;

        // Random X and Y velocities
        this.vx = Math.random() * 20 - 10; //min: -10; max: 10;
        this.vy = Math.random() * 20 - 5;  //min: -5; max 15;

        // Add new particle to the index
        particleIndex++;
        particles[particleIndex] = this;
        this.id = particleIndex;
        this.life = 0;
    }

    //Drawing the particle
    Particle.prototype.draw = function () {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off the ground
        if ((this.y + settings.particleSize) > settings.groundLevel) {
            this.vy *= -0.6;
            this.vx *= 0.75;
            this.y = settings.groundLevel - settings.particleSize;
        }

        // Determine whether to bounce the particle off a wall
        if (this.x - (settings.particleSize) <= settings.leftWall) {
            this.vx *= -1;
            this.x = settings.leftWall + (settings.particleSize);
        }

        if (this.x + (settings.particleSize) >= settings.rightWall) {
            this.vx *= -1;
            this.x = settings.rightWall - settings.particleSize;
        }

        // Adjust for gravity
        this.vy += settings.gravity;

        // Age the particle
        this.life++;

        // If Particle is old, remove it
        if (this.life >= settings.maxLife) {
            delete particles[this.id];
        }

        // Create the shapes
        _context.beginPath();
        _context.fillStyle = settings.particleColor;
        _context.arc(this.x, this.y, settings.particleSize, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }

    //Interval for animating
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "rgba(10,10,10,0.8)";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        // Draw the particles
        for (var i = 0; i < settings.density; i++) {
            if (Math.random() > 0.97) {
                // Introducing a random chance of creating a particle
                // corresponding to an chance of 1 per second,
                // per "density" value
                new Particle();
            }
        }

        for (var pi in particles) {
            particles[pi].draw();
        }
    }, 30));
}

//Generating some particles with walls
function generateParticlesWithWallsNoCollide() {

    //Erease the canvas an kill all intervalls run before
    erease();

    var particles = {},
        particleIndex = 0;

    //Settings
    var settings = {
        density: 5,
        particleSize: 5,
        particleColor: "#0000ff",
        startingX: _canvas.width / 2,
        startingY: _canvas.height / 4,
        gravity: 0.5,
        maxLife: 300,
        groundLevel: _canvas.height,
        leftWall: _canvas.width * 0.25,
        rightWall: _canvas.width * 0.75
    };

    //the particle
    function Particle() {
        // Establish starting positions and velocities
        this.x = settings.startingX;
        this.y = settings.startingY;

        // Random X and Y velocities
        this.vx = Math.random() * 20 - 10; //min: -10; max: 10;
        this.vy = Math.random() * 20 - 5;  //min: -5; max 15;

        // Add new particle to the index
        particleIndex++;
        particles[particleIndex] = this;
        this.id = particleIndex;
        this.life = 0;
    }

    //Drawing the particle
    Particle.prototype.draw = function () {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off the ground
        if ((this.y + settings.particleSize) > settings.groundLevel) {
            this.vy *= -0.6;
            this.vx *= 0.75;
            this.y = settings.groundLevel - settings.particleSize;
        }

        // Determine whether to bounce the particle off a wall
        if (this.x - (settings.particleSize) <= settings.leftWall) {
            this.vx *= -1;
            this.x = settings.leftWall + (settings.particleSize);
        }

        if (this.x + (settings.particleSize) >= settings.rightWall) {
            this.vx *= -1;
            this.x = settings.rightWall - settings.particleSize;
        }

        // No Collide
        for(var pi in particles) {
            var oParticle = particles[pi];    
            if (this.id != oParticle.id){
                var xdist = Math.abs(oParticle.x - this.x);
                var ydist = Math.abs(oParticle.y - this.y);
                var dist = Math.sqrt(Math.pow(xdist, 2) + Math.pow(ydist, 2));
                if (dist < (settings.particleSize * 2)) {

                    this.vx *= -0.75;
                    this.vy *= -0.75;

                    if (this.y < oParticle.y) {
                        this.y -= (Math.abs((settings.particleSize * 2) - dist));                        
                    }
                    // if (this.y > oParticle.y) {
                    //     this.y += (Math.abs((settings.particleSize * 2) - dist));
                    // }
                    if (this.x < oParticle.x) {
                        this.x -= (Math.abs((settings.particleSize * 2) - dist));
                    } 
                    if (this.x > oParticle.x){
                        this.x += (Math.abs((settings.particleSize * 2) - dist));
                    }
                }
            }
        }

        // Adjust for gravity
        this.vy += settings.gravity;

        // Age the particle
        this.life++;

        // If Particle is old, remove it
        if (this.life >= settings.maxLife) {
            delete particles[this.id];
        }

        // Create the shapes
        _context.beginPath();
        _context.fillStyle = settings.particleColor;
        if (this.id == 1) {
            _context.fillStyle = "#ff0000";
        }
        _context.arc(this.x, this.y, settings.particleSize, 0, Math.PI * 2, true);
        _context.closePath();
        _context.fill();
    }

    //Interval for animating
    refreshIntervalIds.push(setInterval(function () {
        // Erase canvas
        _context.fillStyle = "rgba(10,10,10,0.8)";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        // Draw the particles
        for (var i = 0; i < settings.density; i++) {
            if (Math.random() > 0.97) {
                // Introducing a random chance of creating a particle
                // corresponding to an chance of 1 per second,
                // per "density" value
                // if (particles[1000] == null) {
                    new Particle();
                // }
            }
        }

        for (var pi in particles) {
            particles[pi].draw();
        }
    }, 30));
}


/**
 * Erease the actually context and draw the canvas new.
 * It also clear all intvervals
 */
function erease() {
    // Erase canvas
    _context.fillStyle = "black";
    _context.fillRect(0, 0, _canvas.width, _canvas.height);

    //Kill intervall
    for (let refreshIntervalId of refreshIntervalIds) {
        clearInterval(refreshIntervalId);
    }
    refreshIntervalIds = [];
}