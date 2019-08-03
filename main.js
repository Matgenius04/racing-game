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
    },
    start: {
        x: 0,
        y: 0,
        // onchange html automatically converts degrees to radians
        // where 0 degrees is pointing towards the top of the screen
        rot: Math.PI / 2, // start at 90 degrees or pointing forward
    }
};
let mouse = {
    x1: undefined,
    y1: undefined,
    x2: undefined,
    y2: undefined,
    goal: undefined
};
let lines = [];
// drawOn is the variable that tells what drawOn the player is in
// if in mode drawOn (aka true) then draw the lines of the mouse
// otherwise don't 
let drawOn = true;
let drawGoal = false;
let checkForUndo = true;
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
            mouse.goal = drawGoal;
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
        if (drawOn == true && mouse.x1 != undefined && mouse.x2 != undefined) {
            mouse.x2 = ev.clientX - (document.body.clientWidth / 2);
            mouse.y2 = -ev.clientY + (document.body.clientHeight / 2);
            // push current mouse coords into lines array
            if ((mouse.x1 == mouse.x2 && mouse.y1 == mouse.y2) == false) {
                lines.push({
                    x1: mouse.x1,
                    y1: mouse.y1,
                    x2: mouse.x2,
                    y2: mouse.y2,
                    goal: drawGoal,
                });
                // update the lines array showing in the box
                let txt = document.querySelector("#lines");
                txt.innerHTML = lines.toSource();
            }
        }
        // clear mouse coord
        mouse.x1 = undefined;
        mouse.y1 = undefined;
        mouse.x2 = undefined;
        mouse.y2 = undefined;
    });
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
    // updates position
    player.x += player.vx;
    player.y += player.vy;
    //simulate friction/gravity/air resistance
    player.vx *= 85 / 100;
    player.vy *= 85 / 100;
    // put position info in the box
        document.getElementById("position").innerHTML = `x: ${player.x.toPrecision(2)} y: ${player.y.toPrecision(2)} rot: ${((180 * (player.rot/Math.PI)).toPrecision(2) % 360)-90}`;
    // draws player
    drawPlayer();
    // draws all the lines in array lines and does collision detection
    let stopDetecting = false;
    for (let i = 0; i < lines.length; i++) {
        // draw the line
        drawLine(lines[i]);
        // get all of the player vertices and make them into the lines of the triangle
        let pv = player.vertices;
        let line1 = {x1:pv.x1,y1:pv.y1,x2:pv.x2,y2:pv.y2};
        let line2 = {x1:pv.x2,y1:pv.y2,x2:pv.x3,y2:pv.y3};
        let line3 = {x1:pv.x3,y1:pv.y3,x2:pv.x1,y2:pv.y1};
        // console.log(intercepting(line1,lines[i]).b);
        if ((intercepting(line1,lines[i]).b == true
        || intercepting(line2,lines[i]).b == true
        || intercepting(line3,lines[i]).b == true)
        && stopDetecting == false) {
            if (lines[i].goal == true) {
                collisionHandler(true);
                console.log("YOU WON!!!!");
            } else {
                collisionHandler(false);
                console.log("COLLISION!!!!!!!!");
            }
            stopDetecting = true;
        }
    }
    // draws the line that the player is currently drawing
    drawLine({
        x1: mouse.x1,
        y1: mouse.y1,
        x2: mouse.x2,
        y2: mouse.y2,
        goal: mouse.goal
    });
}

function drawLine(line) {
    ctx.beginPath();
    if (line.goal == true) {
        ctx.strokeStyle = "green";
    } else {
        ctx.strokeStyle = "black";
    }
    let e = line;
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
    // draw that triangle
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.moveTo(pv.x1, pv.y1);
    ctx.lineTo(pv.x2, pv.y2);
    ctx.lineTo(pv.x3, pv.y3);
    ctx.closePath();
    ctx.fill();
}
// checks to see what key combinations are pressed down at the time
function checkCombinations() {
    if (keys.find((v) => v == "w")) {
        player.vx += (1) * Math.cos(player.rot);
        player.vy += (1) * Math.sin(player.rot);
    }
    if (keys.find((v) => v == "s")) {
        player.vx -= (1/2) * Math.cos(player.rot);
        player.vy -= (1/2) * Math.sin(player.rot);
    }
    if (keys.find((v) => v == "a")) {
        player.rot += 5 * (Math.PI / 180);
    }
    if (keys.find((v) => v == "d")) {
        player.rot -= 5 * (Math.PI / 180);
    }
    if (keys.find((v) => v == "Control") && keys.find((v) => v =="z") && checkForUndo == true) {
        lines.pop();
        checkForUndo = false;
        setTimeout(()=>{checkForUndo = true}, 500);
    }
}
// handles the collision based on whether or not it's hitting the goal
function collisionHandler(goal) {
    if (goal == true) {

    } else {
        player.x = player.start.x;
        player.y = player.start.y;
        player.rot = player.start.rot;
        player.vx = 0;
        player.vy = 0;
    }
}
// handles when button to show and hide line data is clicked
let lineDataShown = false;
function toggleLineData() {
    let txt = document.querySelector("#lines");
    let button = document.querySelector("#toggle-line-data");
    if (lineDataShown == false) {
        txt.innerHTML = lines.toSource();
        button.innerHTML = "Show Line Data";
        txt.hidden = true;
        lineDataShown = true;
    } else {
        txt.hidden = false;
        button.innerHTML = "Hide Line Data";
        lineDataShown = false;
    }
}