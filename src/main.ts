import { MetaballAnimation } from './metaballs_oop.ts'
import { MbConfig } from './metaballs_oop.ts'

// The weird side offset has to do with how many squares you calculate in metaballs_oop
let config: MbConfig = { // change this if you'd like!
  sample_res: 50000, // number of squares to sample from the area
  circ_count: 18, // number of circles
  // upper and lower bounds for randomised velocity
  vel_lo: 1,
  vel_hi: 2,
  // upper and lower bounds for radius size generation
  rad_lo: 1,
  rad_hi: 1,
  strength: 1.6, //intensity modifier - 1 is fine
  debug: false, 
}; 

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

// let lastFrameTime = 0;
// const targetFPS = 40;
// const frameInterval = 1000 / targetFPS; // in ms 

// function frame(): void {
//   const now = performance.now();
//   const delta = now - lastFrameTime;

//   if (delta >= frameInterval) {
//       lastFrameTime = now;
//       frameInst(anim1); 
//   }

//   stopId = window.requestAnimationFrame(frame);
// }

function frame (): void {
  if(toggle) {
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
  if (anim_instance.debug_bool == true) {
      anim_instance.createDebuggingNet(anim_instance.sample_res); // should be at the top?
  }
  // calculate and update the positions of each circle
  for (let circ1 of anim_instance.circles) {
    // console.log(circ1);
    anim_instance.updateCircPos(circ1); // I hope this modifies the values
  }
}

window.addEventListener("resize", handleResize);
let resizeTimeout: number;

function handleResize() {
  // Stop the animation immediately
  if (toggle) {
      toggleAnimation(); // This stops the animation
  }

  // Throttle the rest of the resize logic
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
      const smallMobile = window.matchMedia("(max-width: 392px) and (max-aspect-ratio: 1/2)");
      const largeMobile = window.matchMedia("(min-width: 392px) and (max-width: 768px)");
      const tablet = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");

      if (smallMobile.matches || largeMobile.matches || tablet.matches) {
          // Ensure the animation remains stopped
          if (toggle) {
              toggleAnimation(); // Ensure it's stopped
          }
      } else {
          // Restart the animation if needed
          if (!toggle) {
              toggleAnimation();
          }
      }

      // Update canvas dimensions
      const rect = anim1.canvas.getBoundingClientRect();
      anim1.canvas.width = rect.width;
      anim1.canvas.height = rect.height;

      // Recalculate sample dimensions
      anim1.sample_dim = Math.floor(anim1.canvas.width * anim1.canvas.height / anim1.sample_res);
  }, 200); // Throttle resize events
}
  
handleResize(); // start the animation and don't bother if on smaller viewport
