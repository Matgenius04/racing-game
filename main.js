const c = document.body.querySelector("canvas");
const ctx = c.getContext("2d");
const keys = [];
const fps = 60;
// x and y are coordinates
// vx and vy are velocities
// rot is rotation
const player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: Math.PI / 2, // start at 90 degrees or pointing forward
    vertices: {
        x1: undefined,
        y1: undefined,
        x2: undefined,
        y2: undefined,
        x3: undefined,
        y3: undefined,
    }
};
let mouse = {
    x1: undefined,
    y1: undefined,
    x2: undefined,
    y2: undefined
};
const lines = [];
// drawOn is the variable that tells what drawOn the player is in
// if in mode drawOn (aka true) then draw the lines of the mouse
// otherwise don't 
let drawOn = true;

setup();

function setup() {
    // sets up canvas to always be 100% of the screen but never more
    ctx.save();
    c.style.width = "100%";
    c.style.height = "100%";
    c.width = c.clientWidth;
    c.height = c.clientHeight;
    // changes the origin to the center of the canvas
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(1, -1);
    window.addEventListener("resize", (ev) => {
        ctx.restore();
        c.style.width = "100%";
        c.style.height = "100%";
        c.width = c.clientWidth;
        c.height = c.clientHeight;
        ctx.translate(c.width / 2, c.height / 2);
        ctx.scale(1, -1);
    });
    // get all keys pressed down
    window.addEventListener("keydown", (ev) => {
        if (keys.find((v) => v == ev.key) == undefined) {
            keys.push(ev.key);
        }
    });
    // get rid of keys that are released
    window.addEventListener("keyup", (ev) => {
        keys.splice(keys.findIndex((v) => v == ev.key), 1);
    });
    // check if mouse is down or not and then get coords
    window.addEventListener("mousedown", (ev) => {
        // get coords
        if (drawOn == true) {
            mouse.x1 = ev.clientX - (document.body.clientWidth / 2);
            mouse.y1 = -ev.clientY + (document.body.clientHeight / 2);
        }
    });
    window.addEventListener("mousemove", (ev) => {
        // get coords
        if (drawOn == true) {
            mouse.x2 = ev.clientX - (document.body.clientWidth / 2);
            mouse.y2 = -ev.clientY + (document.body.clientHeight / 2);
        }
    })
    window.addEventListener("mouseup", (ev) => {
        if (drawOn == true) {
            mouse.x2 = ev.clientX - (document.body.clientWidth / 2);
            mouse.y2 = -ev.clientY + (document.body.clientHeight / 2);
            // push current mouse coords into lines array
            if (mouse.x1 != mouse.x2) {
                lines.push({
                    x1: mouse.x1,
                    y1: mouse.y1,
                    x2: mouse.x2,
                    y2: mouse.y2
                });
            }
        }
        // clear mouse coord
        mouse.x1 = undefined;
        mouse.y1 = undefined;
        mouse.x2 = undefined;
        mouse.y2 = undefined;
    })
    window.requestAnimationFrame(draw);
}

function draw() {
    setTimeout(() => {
        window.requestAnimationFrame(draw);
    }, 1000 / fps);
    checkCombinations();
    // clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
    // draws player
    drawPlayer();
    // draws the line that the player is currently drawing
    for (let i = 0; i < lines.length; i++) {
        drawLine(lines[i]);
        let pv = player.vertices;
        let line1 = {x1:pv.x1,y1:pv.y1,x2:pv.x2,y2:pv.y2};
        let line2 = {x1:pv.x2,y1:pv.y2,x2:pv.x3,y2:pv.y3};
        let line3 = {x1:pv.x3,y1:pv.y3,x2:pv.x1,y2:pv.y1};
        // console.log(intercepting(line1,lines[i]).b);
        if (intercepting(line1,lines[i]).b == true
        || intercepting(line2,lines[i]).b == true
        || intercepting(line3,lines[i]).b == true) {
            console.log("COLLISION!!!!!!!!");
        }
    }
    // updates position
    player.x += player.vx;
    player.y += player.vy;
    //simulate friction/gravity/air resistance
    player.vx *= 19 / 20;
    player.vy *= 19 / 20;
    // draw mouse line
    drawLine({
        x1: mouse.x1,
        y1: mouse.y1,
        x2: mouse.x2,
        y2: mouse.y2
    });
}

function drawLine(line) {
    let e = line;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(e.x1, e.y1);
    ctx.lineTo(e.x2, e.y2);
    ctx.stroke();
    ctx.closePath();
}

function drawPlayer() {
    ctx.beginPath();
    let pv = player.vertices;
    // get all the player vertices based on a triangle in a circle
    pv.x1 = player.x + (10 * Math.cos(player.rot));
    pv.y1 = player.y + (10 * Math.sin(player.rot));
    pv.x2 = player.x + (10 * Math.cos(player.rot + (140 * (Math.PI / 180))));
    pv.y2 = player.y + (10 * Math.sin(player.rot + (140 * (Math.PI / 180))));
    pv.x3 = player.x + (10 * Math.cos(player.rot + (220 * (Math.PI / 180))));
    pv.y3 = player.y + (10 * Math.sin(player.rot + (220 * (Math.PI / 180))));
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.moveTo(pv.x1, pv.y1);
    ctx.lineTo(pv.x2, pv.y2);
    ctx.lineTo(pv.x3, pv.y3);
    ctx.closePath();
    ctx.fill();
}

function checkCombinations() {
    if (keys.find((v) => v == "w")) {
        player.vx += Math.cos(player.rot);
        player.vy += Math.sin(player.rot);
    }
    if (keys.find((v) => v == "s")) {
        player.vx -= Math.cos(player.rot);
        player.vy -= Math.sin(player.rot);
    }
    if (keys.find((v) => v == "a")) {
        player.rot += 5 * (Math.PI / 180);
    }
    if (keys.find((v) => v == "d")) {
        player.rot -= 3 * (Math.PI / 180);
    }
}