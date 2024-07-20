// let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
// let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
// var canvas ?
const canvas = document.getElementById("left");
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width; // might need to add a window listener to update these as we rescale
canvas.height = rect.height;
// should the heights and widths etc be vars because I'm gonna be rescaling the whole thing 
const ctx = canvas.getContext('2d');
var true_vw = rect.width;
var true_vh = rect.height; // i should probably call these vw vh and the other one "true", or i should call this container height/width or something
// const imgData = ctx.createImageData(true_vw, vh);

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

/**
 * Generates circles with random radii and velocities.
 * 
 * @param {number} circ_count - The number of circles to be generated.
 * @param {Array} vel_thresh - The upper and lower bound of the net velocities of the circles (in % of container width per frame).
 * @param {Array} rad_thresh - The interval of the size of radii to be generated (as a percentage of the container width).
 * @returns {Object} - A circle object with the following attributes:
 * {x:x coordinate, y:y coordinate, r:radius of circle, x_comp:x component of velocity, y_comp:y component of velocity}
 */
function generateCircles(circ_count, vel_thresh, rad_thresh) {
    let circles = [];
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
    return circles;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main(fps, sample_res, circ_count, vel_thresh, rad_thresh, strength, debug_bool) {
    var circles = generateCircles(circ_count, vel_thresh, rad_thresh);
    let renderMetaballs = true;
    window.addEventListener('resize', updateDimensions);
    while (renderMetaballs == true) {
        frame(circles, sample_res, strength, debug_bool); // can this access circles?
        await sleep(1000/fps);
        // Its looping but not updating
        ctx.clearRect(0, 0, canvas.width, canvas.height); // I hope this deletes the previous frame and I haven't created a memory leak
    }
}

// CHANGE THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!

function updateDimensions() {
    true_vw = 0.5 * Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    true_vhvh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}
window.addEventListener('resize', updateDimensions);
function frame(circles, sample_res, strength, debug_bool) {
    // ctx.fillRect(0, 0, true_vw, true_vh); // uncomment this for original functionality
    ctx.strokeStyle = "#363940";
    // createDebuggingNet(sample_res);
    // mainloop
    sampleText(sample_res, circles, strength, debug_bool);
    if (debug_bool == true) {
        createDebuggingNet(sample_res); // should be at the top?
    }
    for (let circ of circles) {
        // Will this update the value of circ in the circles object?
        // console.log(circ);
        calcPos(circ);
        // console.log(circ);
        // drawCirc(circ);
        // Have code which samples the corners of the rectangles specified by the sample res - for use later in metaball generation 
    }
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

function drawCirc(circ) {
    ctx.beginPath();
    ctx.ellipse(circ.x, circ.y, circ.r, circ.r, 0, 0, Math.PI * 2); // Could generate ellipses if you wanted to
    ctx.stroke();
}

// Now we need a function that we can call during frame()
// that samples intensity at each point 
function sampleText(m, circles, strength, debug_bool) {
    var row_w = parseInt(true_vw/m);
    let x = 0;
    let y = 0;
    ctx.fillStyle = "#ADEDE9";
    ctx.strokeStyle = "#1A1C21";
    // ctx.fillRect(0, 0, 400, 40);
    for (let i = 0; i < m; i++) {
        y = 0;
        x += row_w;
        var intensity = 0
        for (let i = 0; i < parseInt(true_vh/row_w); i++) {
            y += row_w;
            intensity = getIntensity(x, y, circles, strength);
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
        // ctx.fillStyle = "#1A1C21";
    }
}

function getIntensity(x, y, circles, strength) {
    let intensity = 0;
    for (let circ of circles) {
        intensity += (strength) / (((circ.x - x) ** 2) + ((circ.y - y) ** 2));
    }
    return parseInt((intensity) * 1000);
}

//fps, sample_res, circ_count, vel_thresh, rad_thresh, strength, debug_bool
main(20, 20, 7, [2,3], [1, 3], 1, false);
// frame(circles, 18);