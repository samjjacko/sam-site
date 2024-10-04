import { MetaballAnimation } from './metaballs_oop.ts'
import { MbConfig } from './metaballs_oop.ts'

// The weird side offset has to do with how many squares you calculate in metaballs_oop
let config: MbConfig = { // change this if you'd like!
  sample_res: 200, // number of rows/cols to sample
  circ_count: 18, // number of circles
  // upper and lower bounds for randomised velocity
  vel_lo: 1,
  vel_hi: 2,
  // upper and lower bounds for radius size generation
  rad_lo: 1,
  rad_hi: 1,
  strength: 1.6, //intensity modifier - 1 is fine
  debug: false
}; 

var anim1 = new MetaballAnimation('bg-canvas', config);
// var anim2 = new MetaballAnimation('sexycanvas2', config);
anim1.canvas.addEventListener("click", toggleAnimation() !);

var toggle = false;
var stopId = 0;

function toggleAnimation() {
  if(toggle == false) {
      toggle = true;
      // console.log(this.toggle)
      window.requestAnimationFrame(frame);
  } else {
      toggle = false;
      cancelAnimationFrame(stopId);
  }
}

function frame (): void {
  frameInst(anim1);
  // frameInst(anim2);
  // frameInst(anim2);
  stopId = window.requestAnimationFrame(frame);
}

function frameInst(anim_instance:MetaballAnimation): void {
  // is it slow to get the canvas dimensions every time?
  anim_instance.ctx.clearRect(0, 0, anim_instance.canvas.width, anim_instance.canvas.height); 
  anim_instance.ctx.strokeStyle = "rgb(31, 33, 43)";
  anim_instance.paintSamples();
  if (anim_instance.debug_bool == true) {
      anim_instance.createDebuggingNet(anim_instance.sample_res); // should be at the top?
  }
  // calculate and update the positions of each circle
  for (let circ1 of anim_instance.circles) {
    // console.log(circ1);
    anim_instance.updateCircPos(circ1); // I hope this modifies the values
  }
}


toggleAnimation();

// do requestAnimationFrame in main
