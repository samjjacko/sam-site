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
