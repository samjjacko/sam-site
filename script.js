const curPage = window.location.pathname;
console.log(curPage)
const pages = ["/about.html", "/projects.html", "/other.html"]
// You can query hrefs and then make a list of files
for (i in pages) {
    let navText = document.getElementById(pages[i].slice(1, -5))
    if (curPage != pages[i]) {
        navText.style.color = '#91ECE6'
    } else {
        navText.style.color = '#D498EE'
    }
}
// handling the width of the side bars
function updateSidebars() {
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    var bg_container = document.getElementById('background-cell');
    var bg_container_pos = bg_container.getBoundingClientRect();
    var l = bg_container_pos.left;
    var r = bg_container_pos.right;
    // console.log(l)
    // console.log(r)
    var width = window.screen.width;
    var l_bar = document.getElementById('left')
    var r_bar = document.getElementById('right')
    l_bar.style.setProperty('width', (0.8 * l) + 'px');
    r_bar.style.setProperty('width', (0.8 * (vw - r)) + 'px');
}

// What if i did this with grid lol

updateSidebars(); // just to initialise widths on startup 
window.addEventListener('resize', updateSidebars);
// function intensity(x0, y0, x1, y1, strength) {
//     return (strength ** 2) / (((x1 - x0) ** 2) + ((y1 - y0) ** 2))
// }

// function metaBalls(bar_id) {
//     var canvas = getElementById(bar_id);
//     var ctx = canvas.getContext("2d"); // 
//     // dodgy
//     canvas.width = canvas.style.width;
//     canvas.height = canvas.style.height;
// }



// When intensity is less than 1, don't display, otherwise display
// This creates the melding behaviour between shapes 
// Construct several balls with different sizes and position them randomly
// Get them to move around the canvas - use trig functions to make them cyclical
// Maybe create like a double nested array to represent the state of the canvas