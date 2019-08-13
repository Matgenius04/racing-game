const c = document.body.querySelector("#player");
const ctx = c.getContext("2d");
const nnc = document.body.querySelector("#NN");
const nnctx = nnc.getContext("2d");
const keysdown = [];
const fps = 60;
const inputNumber = 4;
let resolution = 1.25;
// how many times to run training function in a second
let trainingspeed = 1; 
let threshold = 0.25;
let learningRate = 1;
let goalNumber = 1;
const player = {
    // x and y are coordinates
    // vx and vy are velocities
    // rot is rotation
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
    },
    pan: {
        x:0,
        y:0
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
let graphics = 0;
const rocket = document.getElementById("rocket");
// orientation is for telling if the canvas' are top half and bottom halves,
// which would be false for the orientation, or if the canvas' are on the
// left and right halves, which is true
let orientation = false;
let training = true;
setup();

function setup() {
    // sets up canvas to always be 100% of the screen but never more
    ctx.save();
    nnctx.save();
    c.style.float = "left";
    nnc.style.float = "right";
    // based on the screen height and screen width, change orientation
    if (document.body.clientHeight > document.body.clientWidth) {
        c.style.width = "100%";
        c.style.height = "50%";
        nnc.style.width = "100%";
        nnc.style.height = "50%";
        orientation = false;
    } else {
        c.style.width = "50%";
        c.style.height = "100%";
        nnc.style.width = "50%";
        nnc.style.height = "100%";
        orientation = true;
    }
    nnc.width = nnc.clientWidth * resolution;
    nnc.height = nnc.clientHeight * resolution;
    c.width = c.clientWidth * resolution;
    c.height = c.clientHeight * resolution;
    // changes the origin to the center of the canvas
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(resolution, -resolution);
    nnctx.translate(nnc.width / 2, nnc.height / 2);
    nnctx.scale(resolution, -resolution);
    if (orientation == true) {
        document.getElementById("divider").className = "divider-vertical";
    } else {
        document.getElementById("divider").className = "divider-horizontal";
    }
    window.addEventListener("resize", (ev) => {
        ctx.restore();
        ctx.save();
        nnctx.restore();
        nnctx.save();
        // based on the screen height and screen width, change orientation
        if (document.body.clientHeight > document.body.clientWidth) {
            c.style.width = "100%";
            c.style.height = "50%";
            nnc.style.width = "100%";
            nnc.style.height = "50%";
            orientation = false;
        } else {
            c.style.width = "50%";
            c.style.height = "100%";
            nnc.style.width = "50%";
            nnc.style.height = "100%";
            orientation = true;
        }
        nnc.width = nnc.clientWidth * resolution;
        nnc.height = nnc.clientHeight * resolution;
        c.width = c.clientWidth * resolution;
        c.height = c.clientHeight * resolution;
        // changes the origin to the center of the canvas
        ctx.translate(c.width / 2, c.height / 2);
        ctx.scale(resolution, -resolution);
        nnctx.translate(nnc.width / 2, nnc.height / 2);
        nnctx.scale(resolution, -resolution);
        if (orientation == true) {
            document.getElementById("divider").className = "divider-vertical";
        } else {
            document.getElementById("divider").className = "divider-horizontal";
        }
    });
    // get all keysdown pressed down
    window.addEventListener("keydown", (ev) => {
        if (keysdown.find((v) => v == ev.key) == undefined) {
            keysdown.push(ev.key);
        }
    });
    // get rid of keysdown that are released
    window.addEventListener("keyup", (ev) => {
        keysdown.splice(keysdown.findIndex((v) => v == ev.key), 1);
    });
    // check if mouse is down or not and then get coords
    window.addEventListener("mousedown", (ev) => {
        // get coords
        if (drawOn == true) {
            if (orientation == true) {
                // if the player canvas is the left half, change the centers of the canvas
                mouse.x1 = (ev.clientX - (document.body.clientWidth / 4));
                mouse.y1 = -ev.clientY + (document.body.clientHeight / 2);
                mouse.goal = drawGoal;
            } else {
                // else if the player canvas is the top half, change the centers of the canvas
                mouse.x1 = ev.clientX - (document.body.clientWidth / 2);
                mouse.y1 = (-ev.clientY + (document.body.clientHeight / 4));
                mouse.goal = drawGoal;
            }
        }
    });
    window.addEventListener("mousemove", (ev) => {
        // get coords
        if (drawOn == true) {
            if (orientation == true) {
                // if the player canvas is the left half, change the centers of the canvas
                mouse.x2 = (ev.clientX - (document.body.clientWidth / 4));
                mouse.y2 = -ev.clientY + (document.body.clientHeight / 2);
            } else {
                // if the player canvas is the top half, change the centers of the canvas
                mouse.x2 = ev.clientX - (document.body.clientWidth / 2);
                mouse.y2 = (-ev.clientY + (document.body.clientHeight / 4));
            }
        }
    })
    window.addEventListener("mouseup", (ev) => {
        if (drawOn == true && mouse.x1 != undefined && mouse.x2 != undefined) {
            if (orientation == true) {
                mouse.x2 = (ev.clientX - (document.body.clientWidth / 4));
                mouse.y2 = -ev.clientY + (document.body.clientHeight / 2);
            } else {
                mouse.x2 = ev.clientX - (document.body.clientWidth / 2);
                mouse.y2 = (-ev.clientY + (document.body.clientHeight / 4));
            }
            // push current mouse coords into lines array
            if ((mouse.x1 == mouse.x2 && mouse.y1 == mouse.y2) == false) {
                lines.push({
                    x1: mouse.x1,
                    y1: mouse.y1,
                    x2: mouse.x2,
                    y2: mouse.y2,
                    goal: drawGoal,
                    goalNumber: goalNumber
                });
                goalNumber++;
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

async function draw() {
    setTimeout(() => {
        window.requestAnimationFrame(draw);
    }, 1000 / fps);
    checkCombinations();
    // clear canvas
    if (graphics == 1) {
        ctx.clearRect(-c.width, -c.height, c.width * (1/resolution), c.height * (1/resolution));
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect((-c.width/2) * (1/resolution), (-c.height/2) * (1/resolution), c.width * (1/resolution), c.height * (1/resolution));
    }
    // updates position
    player.x += player.vx;
    player.y += player.vy;
    //simulate friction/gravity/air resistance
    player.vx *= 85 / 100;
    player.vy *= 85 / 100;
    // put position info in the box
    document.getElementById("position").innerHTML = `x: ${Math.floor(player.x)} y: ${Math.floor(player.y)} rot: ${((180 * (player.rot/Math.PI)).toPrecision(2) % 360)-90}`;
    // draws player
    drawPlayer();
    // draws all the lines in array lines and does collision detection
    let stopDetecting = false;
    for (let i = 0; i < lines.length; i++) {
        // draw the line
        drawLine(lines[i]);
        // get all of the player vertices and make them into the lines of the triangle
        let pv = player.vertices;
        let line1 = {
            x1: pv.x1,
            y1: pv.y1,
            x2: pv.x2,
            y2: pv.y2
        };
        let line2 = {
            x1: pv.x2,
            y1: pv.y2,
            x2: pv.x3,
            y2: pv.y3
        };
        let line3 = {
            x1: pv.x3,
            y1: pv.y3,
            x2: pv.x1,
            y2: pv.y1
        };
        // console.log(intercepting(line1,lines[i]).b);
        if ((intercepting(line1, lines[i]).b == true ||
                intercepting(line2, lines[i]).b == true ||
                intercepting(line3, lines[i]).b == true) &&
            stopDetecting == false) {
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
    if (graphics == 1) {
        if (line.goal == true) {
            ctx.strokeStyle = "rgb(10,255,0)";
        } else {
            ctx.strokeStyle = "white";
        }
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = (ctx.strokeStyle == "rgb(10,255,0)") ? "rgb(10,255,0)" : "white";
    }
    let e = line;
    ctx.moveTo(e.x1, e.y1);
    ctx.lineTo(e.x2, e.y2);
    ctx.stroke();
    ctx.closePath();
    ctx.shadowBlur = "";
    ctx.lineWidth = 1;
}

function drawPlayer() {
    ctx.beginPath();
    let pv = player.vertices;
    // get all the player vertices based on a triangle in a circle
    pv.x1 = player.x + (15 * Math.cos(player.rot));
    pv.y1 = player.y + (15 * Math.sin(player.rot));
    pv.x2 = player.x + (10 * Math.cos(player.rot + (140 * (Math.PI / 180))));
    pv.y2 = player.y + (10 * Math.sin(player.rot + (140 * (Math.PI / 180))));
    pv.x3 = player.x + (10 * Math.cos(player.rot + (220 * (Math.PI / 180))));
    pv.y3 = player.y + (10 * Math.sin(player.rot + (220 * (Math.PI / 180))));
    // draw that triangle
    if (graphics == 1) {
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rot + (Math.PI / 2));
        ctx.drawImage(rocket, -17.5, -15, 35, 30);
        ctx.rotate(-player.rot - (Math.PI / 2));
        ctx.translate(-player.x, -player.y);
    } else {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.moveTo(pv.x1, pv.y1);
        ctx.lineTo(pv.x2, pv.y2);
        ctx.lineTo(pv.x3, pv.y3);
        ctx.closePath();
        ctx.fill();
    }
}
// checks to see what key combinations are pressed down at the time
function checkCombinations() {
    if (keysdown.find((v) => v == "w") || keysdown.find((v) => v == "ArrowUp")) {
        player.vx += (2) * Math.cos(player.rot);
        player.vy += (2) * Math.sin(player.rot);
    }
    if (keysdown.find((v) => v == "s") || keysdown.find((v) => v == "ArrowDown")) {
        player.vx -= (3 / 4) * Math.cos(player.rot);
        player.vy -= (3 / 4) * Math.sin(player.rot);
    }
    if (keysdown.find((v) => v == "a") || keysdown.find((v) => v == "ArrowLeft")) {
        player.rot += 5 * (Math.PI / 180);
    }
    if (keysdown.find((v) => v == "d") || keysdown.find((v) => v == "ArrowRight")) {
        player.rot -= 5 * (Math.PI / 180);
    }
    if (keysdown.find((v) => v == "Control") && keysdown.find((v) => v == "z") && checkForUndo == true) {
        lines.pop();
        checkForUndo = false;
        setTimeout(() => {
            checkForUndo = true
        }, 500);
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