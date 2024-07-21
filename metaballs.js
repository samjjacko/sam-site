// variables for canvas painting
const canvas = document.getElementById("left");
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width; // might need to add a window listener to update these as we rescale
canvas.height = rect.height;
// should the heights and widths etc be vars because I'm gonna be rescaling the whole thing 
const ctx = canvas.getContext('2d');
var true_vw = rect.width;
var true_vh = rect.height; // i should probably call these vw vh and the other one "true", or i should call this container height/width or something
// const imgData = ctx.createImageData(true_vw, vh);


// //fps, sample_res, circ_count, vel_thresh, rad_thresh, strength, debug_bool
// main(20, 20, 7, [2,3], [1, 3], 1, false);
// // frame(circles, 18);
// variables for metaball math
var sample_res = 50;
var circ_count = 8;
var vel_thresh = [2,2];
var rad_thresh = [1,3];
var strength = 1;
var debug_bool = false;
let circles = [];

// variables for animation flow control
var stopId;
var toggle = false;
canvas.addEventListener("click", toggleAnimation);

function toggleAnimation() {
    if(toggle == false) {
        toggle = true;
        console.log(toggle)
        window.requestAnimationFrame(frame);
    } else {
        toggle = false;
        cancelAnimationFrame(stopId);
    }
}

generateCircles(); // updates the global "circles" array

toggleAnimation(); // starts the animation when script is loaded

function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.strokeStyle = "#363940";
    sampleText();
    if (debug_bool == true) {
        createDebuggingNet(sample_res); // should be at the top?
    }
    for (let circ of circles) {
        calcPos(circ);
    }
    stopId = window.requestAnimationFrame(frame)
    // console.log(stopId)
    // so its definitely doing the frames...
}

function generateCircles() {
    for(i = 0; i <= circ_count; i++) {
        let r = parseInt(getRandomInt(rad_thresh[0], rad_thresh[1]) * true_vw / 100);
        // note the presence of r here is to prevent a circle from generating outside the box
        let x = getRandomInt(r, true_vw - r);
        let y = getRandomInt(r, true_vh - r);
        let net_vel = getRandomInt(vel_thresh[0], vel_thresh[1]);
        let x_comp = getRandomInt(1, 9) * polarityCoinToss();
        let y_comp = getRandomInt(1, 9) * polarityCoinToss();
        // makes sure the net velocity is equal to the random velocity net_vel we generated
        let scale = net_vel/(((x_comp**2) + (y_comp**2))**0.5);
        x_comp = parseInt(x_comp * scale);
        y_comp = parseInt(y_comp * scale);
        // console.log(x_comp);
        // console.log(y_comp);
        let circ = {'x':x, 'y':y, 'r':r, 'x_comp':x_comp, 'y_comp':y_comp};
        circles.push(circ);
    }
}

// Now we need a function that we can call during frame()
// that samples intensity at each point 
function sampleText() {
    var row_w = parseInt(true_vw/sample_res);
    let x = 0;
    let y = 0;
    ctx.fillStyle = "#ADEDE9";
    ctx.strokeStyle = "#1A1C21";
    // ctx.fillRect(0, 0, 400, 40);
    for (let i = 0; i < sample_res; i++) {
        y = 0;
        x += row_w;
        var intensity = 0
        for (let i = 0; i < parseInt(true_vh/row_w); i++) {
            y += row_w;
            intensity = getIntensity(x, y);
            if (debug_bool == true) {
                ctx.strokeText(intensity, x, y);
            }
            // ctx.strokeText(intensity, x, y);
            if (intensity >= 1) {
                ctx.clearRect(x, y, row_w, row_w);
                ctx.fillRect(x, y, row_w, row_w);
                // ctx.strokeText(intensity, x, y);
            }
        }
    }
}

function getIntensity(x, y) {
    let intensity = 0;
    for (let circ of circles) {
        intensity += (strength) / (((circ.x - x) ** 2) + ((circ.y - y) ** 2));
    }
    return parseInt((intensity) * 1000);
}

function calcPos(circ) {
    // Calculates the new position of a given circle
    // assumes totally elastic collisions and equivalent masses between circles and border
    // Not great code! There's probably a better way to do this!
    let x1 = circ.x + (circ.x_comp);
    let y1 = circ.y + (circ.y_comp);
    circ.x = x1;
    circ.y = y1;
    let rad = circ.r
    if (x1 <= rad) {
        circ.x = Math.abs(rad - x1) + rad;
        // can I do this
        circ.x_comp *= -1; // reflecting the x component
    } else if (x1 >= true_vw - rad) {
        circ.x = true_vw - Math.abs(x1 - true_vw);
        circ.x_comp *= -1;
    // t_bar and b_bar are confusing - these measure the displac
    } else if (y1 <= rad) {
        circ.y = Math.abs(rad - y1) + rad;
        circ.y_comp *= -1;
    } else if (y1 >= true_vh - rad) {
        circ.y = true_vh - Math.abs(y1 - true_vh);
        circ.y_comp *= -1;
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
ctx.fillStyle = "#1A1C21";
ctx.strokeStyle = "#363940";
ctx.fillRect(0, 0, true_vw, true_vh);

// debugging 
function createDebuggingNet(m) {
// m is number of rows, n is number of columns
    let row_w = parseInt(true_vw/m);
    // let col_w = parseInt(true_vw / n);
    let xpos = 0;
    let ypos = 0;
    ctx.beginPath();
    for (let i = 0; i < m; i++) {
        xpos += row_w;
        ctx.moveTo(xpos, 0);
        ctx.lineTo(xpos, true_vh);
    }
    for (let i = 0; i < parseInt(true_vh/row_w); i++) {
        ypos += row_w;
        ctx.moveTo(0, ypos);
        ctx.lineTo(true_vw, ypos);
    }
    ctx.stroke();
}

function polarityCoinToss() {
    if (Math.random() <= 0.5) {
        return -1;
    } else {
        return 1;
    }
}


// CHANGE THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!

function updateDimensions() {
    true_vw = 0.5 * Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    true_vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}

window.addEventListener('resize', updateDimensions);


//old code
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function drawCirc(circ) {
    ctx.beginPath();
    ctx.ellipse(circ.x, circ.y, circ.r, circ.r, 0, 0, Math.PI * 2); // Could generate ellipses if you wanted to
    ctx.stroke();
}

