import { MetaballAnimation } from './metaballs_oop.ts'
import { MbConfig } from './metaballs_oop.ts'

// The weird side offset has to do with how many squares you calculate in metaballs_oop
let config: MbConfig = { // change this if you'd like!
  sample_res: 50000, // number of squares to sample from the area
  circ_count: 10, // number of circles
  // upper and lower bounds for randomised velocity
  vel_lo: 2,
  vel_hi: 3,
  // upper and lower bounds for radius size generation
  rad_lo: 1,
  rad_hi: 1,
  strength: 2, //intensity modifier - 1 is fine
}; 

if(window.location.href.endsWith("wips.html")) {
  config.sample_res = 100000;
  config.vel_hi = 3;
  config.vel_lo = 2;
  config.circ_count = 22;
  config.strength = 2;
}

var anim1 = new MetaballAnimation('bg-canvas', config); 
// var anim2 = new MetaballAnimation('sexycanvas2', config);
anim1.canvas.addEventListener("click", toggleAnimation);

var toggle = false;
var stopId = 0;

function toggleAnimation() {
  if(toggle == false) {
      toggle = true;
      // console.log(this.toggle)
      stopId = window.requestAnimationFrame(frame);
  } else {
      toggle = false;
      cancelAnimationFrame(stopId);
  }
}

function frame (): void {
  if(toggle) {
    console.log("frame inst anim1, anim1's sample_res:" + anim1.sample_res);
    frameInst(anim1);
    // frameInst(anim2);
    // frameInst(anim2);
    stopId = window.requestAnimationFrame(frame);
  }
}

function frameInst(anim_instance:MetaballAnimation): void {
  // is it slow to get the canvas dimensions every time?
  anim_instance.ctx.clearRect(0, 0, anim_instance.canvas.width, anim_instance.canvas.height); 
  // anim_instance.ctx.strokeStyle = "rgb(31, 33, 43)";
  anim_instance.paintSamplesBetter();
  // calculate and update the positions of each circle
  for (let circ1 of anim_instance.circles) {
    // console.log(circ1);
    anim_instance.updateCircPos(circ1); // I hope this modifies the values
  }
}

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// check if it's a mobile device
function isMobileDevice() {
  // check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  if (hasTouch) console.log("has touch");
  if (isMobile) console.log("is mobile");
  const mobile_dims = (window.innerWidth / window.innerHeight) < (9/8);
  const size_reqs = (window.innerWidth < 768 || window.innerHeight < 768);
  // check if dimensions are the same as those checked by media queries
  return (hasTouch && isMobile) || mobile_dims && size_reqs;
}

function handleResize() {
  console.log("resize");
  // Only proceed if there's a significant size change
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  const widthDiff = Math.abs(currentWidth - lastWidth);
  const heightDiff = Math.abs(currentHeight - lastHeight);
  
  // Ignore small changes that might be caused by mobile browser UI
  if (widthDiff < 50 && heightDiff < 50) {
    return;
  }
  
  lastWidth = currentWidth;
  lastHeight = currentHeight;

    if (isMobileDevice()) {
      // Ensure the animation remains stopped on mobile
      if (toggle) { // will never be true if isMobileDevice returns true consistently
        toggleAnimation();
      }
    } else {
      // Start the animation if needed on desktop
      if (!toggle) {
        toggleAnimation(); 
      }
    }

    // Update canvas dimensions
    // const rect = anim1.canvas.getBoundingClientRect();
    // anim1.canvas.width = rect.width;
    // anim1.canvas.height = rect.height;

    // Recalculate sample dimensions
    anim1.sample_dim = Math.floor(anim1.canvas.width * anim1.canvas.height / anim1.sample_res);
    if (anim1.sample_dim == 0) anim1.sample_dim = 1;
}

if (!isMobileDevice()) {
  // console.log("Initial animation start");
  window.addEventListener("resize", handleResize);
  console.log("Not mobile device, sample res: " + anim1.sample_res);
  toggleAnimation(); // start the animation
} else {
  console.log("phone spotted");
}
