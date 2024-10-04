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
    debug: boolean;
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
function polarityCoinToss() {
    if (Math.random() <= 0.5) {
        return -1;
    } else {
        return 1;
    }
}

export class MetaballAnimation {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    // width and height should be accessed from the canvas object field
    toggle: boolean = false; // Enables/disables the animation
    circles: Array<Circ>;
    stopId: number = 0; //frame for stopping the animation - 0 for now
    sample_res: number;
    strength: number;
    debug_bool: boolean;

    constructor(html_id:string, mb:MbConfig) {
        // constructs the 'canvas' field depending on id passed to class
        this.canvas = document.getElementById(html_id) as HTMLCanvasElement;
        const rect = this.canvas.getBoundingClientRect();
        // might need to add a window listener to update these as we rescale
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx = this.canvas.getContext('2d') !; // should never be null, now that we've set our canvas size
        // this.canvas.addEventListener("click", this.toggleAnimation);

        // setup meaningful field variables
        this.sample_res = mb.sample_res;
        this.strength = mb.strength;
        this.debug_bool = mb.debug;
        this.circles = this.generateCircles(mb);
        // console.log(this.circles)
    }

    generateCircles(mb:MbConfig): Array<Circ> {
        let temp_circs: Array<Circ> = Array(); // dodgy
        for(let i = 0; i <= mb.circ_count; i++) {
            // Calculating velocity
            let net_vel = getRandomInt(mb.vel_lo, mb.vel_hi);
            let x_vel: number = getRandomInt(1, 9) * polarityCoinToss();
            let y_vel: number = getRandomInt(1, 9) * polarityCoinToss();
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
    
    paintSamples():void {
        var row_w = Math.floor(this.canvas.width/this.sample_res);
        let x = 0;
        let y = 0;
        this.ctx.fillStyle = "#ADEDE9";
        // this.ctx.fillStyle = "rgb(31, 33, 43)";
        this.ctx.strokeStyle = "#1A1C21";
        // ctx.fillRect(0, 0, 400, 40);
        let grad = [135/this.sample_res, 84/this.sample_res];
        // this can definitely be optimised
        let horiz_count: number = Math.floor(this.canvas.width/row_w);
        for (let i = 0; i < horiz_count; i++) {
            y = 0;
            x += row_w;
            var intensity: number = 0
            let temp = [grad[0] * i, grad[1] * i]; 
            // gradient colours - 115, 123, 248 on left, 250, 207, 250 on right
            // so 135, 84, and 2
            this.ctx.fillStyle = 
                `rgb(${115 + temp[0]}, ${123 + temp[1]}, 248)`;
            for (let i = 0; i < Math.floor(this.canvas.height/row_w); i++) {
                y += row_w;
                intensity = this.getIntensity(x, y); 
                if (this.debug_bool == true) {
                    // seems sus
                    this.ctx.strokeText(String(intensity), x, y);
                }
                if (intensity >= 1) {
                    this.ctx.fillRect(x, y, row_w, row_w);
                }
            }
        }
    }

    getIntensity(x:number, y:number): number { 
        // Samples intensity at x, y by accumulating the relative intensities 
        // of circles from `this.circles`, and returns a scaled up intensity value
        let intensity = 0;
        for (let circ of this.circles) {
            intensity += (this.strength) / (((circ.x - x) ** 2) + ((circ.y - y) ** 2));
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

    createDebuggingNet(m:number) {
        let width = this.canvas.width;
        let height = this.canvas.height;
        // m is number of rows, n is number of columns
            let row_w = Math.floor(width/m);
            // let col_w = parseInt(true_vw / n);
            let xpos = 0;
            let ypos = 0;
            this.ctx.beginPath();
            for (let i = 0; i < m; i++) {
                xpos += row_w;
                this.ctx.moveTo(xpos, 0);
                this.ctx.lineTo(xpos, height);
            }
            for (let i = 0; i < Math.floor(height/row_w); i++) {
                ypos += row_w;
                this.ctx.moveTo(0, ypos);
                this.ctx.lineTo(width, ypos);
            }
            this.ctx.stroke();
        }
}