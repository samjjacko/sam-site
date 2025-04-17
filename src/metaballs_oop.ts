export type MbConfig = {
    sample_res: number; // number of rows/cols to sample
    // number of circles
    circ_count: number;
    // upper and lower bounds for randomised velocity
    vel_lo: number;
    vel_hi: number
    // upper and lower bounds for radius size generation
    rad_lo: number;
    rad_hi: number;
    strength: number; //intensity modifier - 1 is fine
};

export type Circ = {
    x: number; // x coord
    y: number; // y coord
    r: number; // radius
    // velocity components
    x_comp: number;
    y_comp: number;
}

// helper functions
function getRandomInt(min:number, max:number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}
function Bernoulli() {
    if (Math.random() <= 0.5) {
        return -1;
    } else {
        return 1;
    }
}


// seems useful https://lisyarus.github.io/blog/posts/building-a-quadtree.html
// type node = {
//     children: Array<node>[4];
// }

// type quadtree = {
//     root: node;

// }

export class MetaballAnimation {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    // width and height should be accessed from the canvas object field
    toggle: boolean = false; // Enables/disables the animation
    circles: Array<Circ>;
    stopId: number = 0; //frame for stopping the animation - 0 for now
    sample_res: number;
    strength: number;
    hue_rotation: number;
    sin_hue: number;
    sample_dim: number;
    frame_count: number;
    // only updated on resize event
    saturation_gradient: number;
    lightness_gradient: number;
    hue_gradient: number;
    hslCache: Array<number[]> = [];

    constructor(html_id:string, mb:MbConfig) {
        // initialising fields 
        this.hue_rotation = 0;
        this.frame_count = 0;
        this.sin_hue = 0;
        // constructs the 'canvas' field depending on id passed to class
        this.canvas = document.getElementById(html_id) as HTMLCanvasElement;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx = this.canvas.getContext('2d') !; // should never be null, now that we've set our canvas size
        // this.canvas.addEventListener("click", this.toggleAnimation);

        // setup meaningful field variables
        this.sample_res = mb.sample_res;
        // the height/width of a given sample to be drawn to the canvas
        // something is shrinking the canvas height
        this.sample_dim = Math.floor(this.canvas.width * this.canvas.height / this.sample_res);
        // if (this.sample_dim < 1) this.sample_dim = 1; // avoids insane 
        this.strength = mb.strength;
        this.circles = this.generateCircles(mb);
        // here 90.5 and 81.1 are the saturation values for the starting colours 
        // maybe add the starting position to mbConfig
        // if i want to add a rotating effect, instead of dividing by width and height, maybe divide by the 
        // "diameter" of a line at some angle from the center of the canvas, and change the 
        // colour-setting logic accordingly; might make it a bit slow though.
        this.saturation_gradient = (90.5 - 81.1) * this.sample_dim / this.canvas.width;
        this.lightness_gradient =  (71.2 - 89.6 + 20) * this.sample_dim / this.canvas.width;
        this.hue_gradient = (236 - 300) * this.sample_dim / this.canvas.width;
    }

    generateCircles(mb:MbConfig): Array<Circ> {
        let temp_circs: Array<Circ> = Array(); // dodgy
        for(let i = 0; i <= mb.circ_count; i++) {
            // Calculating velocity
            let net_vel = getRandomInt(mb.vel_lo, mb.vel_hi);
            let x_vel: number = getRandomInt(1, 9) * Bernoulli();
            let y_vel: number = getRandomInt(1, 9) * Bernoulli();
            // makes sure the net velocity is equal to the random velocity net_vel we generated
            let scale: number = net_vel/(((x_vel**2) + (y_vel**2))**0.5);

            let rad = Math.floor(getRandomInt(mb.vel_lo, mb.vel_hi) * this.canvas.width / 100);
            // the use of `rad` in the x, y, coords is to make sure circles
            // generate inside the canvas
            let circ: Circ = {
                x_comp: Math.floor(x_vel * scale), 
                y_comp: Math.floor(y_vel * scale),
                x: getRandomInt(rad, this.canvas.width - rad),
                y: getRandomInt(rad, this.canvas.height - rad),
                r: rad
            }
            temp_circs.push(circ);
        }
        return temp_circs;
    }
    
    // should it even be returning then if we can just modify an existing array
    calcHSL(x: number, hsl_vals: number[] = [0, 0, 0]):void {
        // rotate hue
        hsl_vals[0] = (236 - (this.hue_gradient * x)) * this.sin_hue;
        hsl_vals[1] = 90.5 - (this.saturation_gradient * x);
        hsl_vals[2] = 71.2 - (this.lightness_gradient * x);
    }
    
    paintSamplesBetter():void {
        if(this.frame_count % 16 == 0) {
            this.hue_rotation += Math.PI/16;
            this.sin_hue = Math.sin(this.hue_rotation) * 0.1;
        }

        const count = Math.ceil(this.canvas.width / this.sample_dim);
        this.hslCache = new Array(count).fill(0).map(() => [0,0,0]);
        for (let i = 0, x = 0; i < this.hslCache.length; i++, x += this.sample_dim) {
            this.calcHSL(x, this.hslCache[i]);
        }
        this.ctx.beginPath();
        // let intensity: number;
        // let x_pos = 0;
        // let intensity = 0;
        for(let y = 0; y < this.canvas.height; y += this.sample_dim) {
            for(let x = 0; x < this.hslCache.length; x ++) {
                const x_pos = x * this.sample_dim;
                const intensity = this.getIntensity(x_pos, y);
                if (intensity >= 1) {
                    const c = this.hslCache[x];
                    this.ctx.fillStyle = `hsl(${c[0]}, ${c[1]}%, ${c[2]}%)`;
                    this.ctx.fillRect(x_pos, y, this.sample_dim, this.sample_dim);
                }
            }
        }
        this.ctx.closePath();
        this.frame_count++;
    }

    // can improve this by constructing a quad tree
    getIntensity(x:number, y:number): number { 
        // Samples intensity at x, y by accumulating the relative intensities 
        // of circles from `this.circles`, and returns a scaled up intensity value
        let intensity = 0;
        let x_dis;
        let y_dis;
        for (let circ of this.circles) {
            x_dis = circ.x - x;
            y_dis = circ.y - y;
            intensity += (this.strength) / (x_dis * x_dis + y_dis * y_dis);
        }
        return Math.floor((intensity) * 1000);
    }

    updateCircPos(circ:Circ) {
        // Calculates the new position of a given circle
        // assumes totally elastic collisions and equivalent masses between circles and border
        // Not great code! There's probably a better way to do this!
        circ.x = circ.x + (circ.x_comp);
        circ.y = circ.y + (circ.y_comp);
        let rad = circ.r;
        let width = this.canvas.width;
        let height = this.canvas.height;

        if (circ.x <= rad) { // we've bumped the left wall
            // update the circle to where it SHOULD be, inside the canvas
            circ.x = Math.abs(rad - circ.x) + rad; 
            // can I do this
            circ.x_comp *= -1; // reflecting the x component
        } else if (circ.x >= width - rad) { // we've bumped the right wall
            circ.x = width - Math.abs(circ.x - width);
            circ.x_comp *= -1;
        } else if (circ.y <= rad) { // we've bumped the bottom wall
            circ.y = Math.abs(rad - circ.y) + rad;
            circ.y_comp *= -1;
        } else if (circ.y >= height - rad) { // bumped top wall
            circ.y = height - Math.abs(circ.y - height);
            circ.y_comp *= -1;
        }
    }
}