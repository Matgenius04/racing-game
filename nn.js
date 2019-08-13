const NN = {
    // look at player comments if something doesn't make sense
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: Math.PI / 2,
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
        rot: Math.PI / 2,
    }
};
const NNcontrols = {
    w: false,
    a: false,
    s: false,
    d: false
}

const train = setInterval(trainNN, 1000 / trainingspeed);
const model = tf.sequential({
    layers: [
        tf.layers.dense({
            inputShape: [inputNumber],
            units: inputNumber,
            activation: 'relu'
        }),
        tf.layers.dense({
            units: 50,
            activation: 'relu'
        }),
        tf.layers.dense({
            units: 50,
            activation: 'relu'
        }),
        tf.layers.dense({
            units: 50,
            activation: 'relu'
        }),
        tf.layers.dense({
            units: 4,
            activation: 'softmax'
        })
    ]
})

function trainNN() {
    console.clear();
    nnctx.fillStyle = "white";
    nnctx.fillRect((-nnc.width/2) * (1/resolution), (-nnc.height/2) * (1/resolution), nnc.width * (1/resolution), nnc.height * (1/resolution));
    drawNN(false);
    tf.tensor(filterDistances(getSurroundings(inputNumber, NN.x, NN.y, NN.rot)), [1, inputNumber]).print();
    model.predict(tf.tensor(filterDistances(getSurroundings(inputNumber, NN.x, NN.y, NN.rot)), [1, inputNumber])).print();
    model.predict(tf.tensor(filterDistances(getSurroundings(inputNumber, NN.x, NN.y, NN.rot)), [1, inputNumber])).array().then((v) => {
        NNcontrols.w = (v[0][0] >= threshold) ? true : false;
        // console.log((v[0] >= threshold) ? true : false)
        NNcontrols.a = (v[0][1] >= threshold) ? true : false;
        NNcontrols.s = (v[0][2] >= threshold) ? true : false;
        NNcontrols.d = (v[0][3] >= threshold) ? true : false;
    });
    console.log(NNcontrols);
    checkCombinationsNN();
    NN.x += NN.vx;
    NN.y += NN.vy;
    NN.vx *= 85 / 100;
    NN.vy *= 85 / 100;
    let NNv = NN.vertices;
    for (let i = 0; i < lines.length; i++) {
        drawLineNN(lines[i])
    let line1 = {
        x1: NNv.x1,
        y1: NNv.y1,
        x2: NNv.x2,
        y2: NNv.y2
    };
    let line2 = {
        x1: NNv.x2,
        y1: NNv.y2,
        x2: NNv.x3,
        y2: NNv.y3
    };
    let line3 = {
        x1: NNv.x3,
        y1: NNv.y3,
        x2: NNv.x1,
        y2: NNv.y1
    };
    let stopDetecting = false;
    if ((intercepting(line1, lines[i]).b == true ||
        intercepting(line2, lines[i]).b == true ||
        intercepting(line3, lines[i]).b == true) &&
        stopDetecting == false) {
        if (lines[i].goal == true) {
            collisionHandlerNN(true);
            console.log("NN WON!!!!");
        } else {
            collisionHandlerNN(false);
            console.log("NN COLLISION!!!!!!!!");
        }
        stopDetecting = true;
    }

}
}

function drawNN(disableDraw) {
    nnctx.beginPath();
    let NNv = NN.vertices;
    // get all the NN vertices based on a triangle in a circle
    NNv.x1 = NN.x + (15 * Math.cos(NN.rot));
    NNv.y1 = NN.y + (15 * Math.sin(NN.rot));
    NNv.x2 = NN.x + (10 * Math.cos(NN.rot + (140 * (Math.PI / 180))));
    NNv.y2 = NN.y + (10 * Math.sin(NN.rot + (140 * (Math.PI / 180))));
    NNv.x3 = NN.x + (10 * Math.cos(NN.rot + (220 * (Math.PI / 180))));
    NNv.y3 = NN.y + (10 * Math.sin(NN.rot + (220 * (Math.PI / 180))));
    if (disableDraw != true) {
        // draw that triangle
        if (graphics == 1) {
            nnctx.translate(NN.x, NN.y);
            nnctx.rotate(NN.rot + (Math.PI / 2));
            nnctx.drawImage(rocket, -17.5, -15, 35, 30);
            nnctx.rotate(-NN.rot - (Math.PI / 2));
            nnctx.translate(-NN.x, -NN.y);
        } else {
            nnctx.beginPath();
            nnctx.fillStyle = "black";
            nnctx.moveTo(NNv.x1, NNv.y1);
            nnctx.lineTo(NNv.x2, NNv.y2);
            nnctx.lineTo(NNv.x3, NNv.y3);
            nnctx.closePath();
            nnctx.fill();
        }
    }
}

function drawLineNN(line) {
    nnctx.beginPath();
    if (line.goal == true) {
        nnctx.strokeStyle = "green";
    } else {
        nnctx.strokeStyle = "black";
    }
    if (graphics == 1) {
        if (line.goal == true) {
            nnctx.strokeStyle = "rgb(10,255,0)";
        } else {
            nnctx.strokeStyle = "white";
        }
        nnctx.lineWidth = 5;
        nnctx.shadowBlur = 20;
        nnctx.shadowColor = (nnctx.strokeStyle == "rgb(10,255,0)") ? "rgb(10,255,0)" : "white";
    }
    let e = line;
    nnctx.moveTo(e.x1, e.y1);
    nnctx.lineTo(e.x2, e.y2);
    nnctx.stroke();
    nnctx.closePath();
    nnctx.shadowBlur = "";
    nnctx.lineWidth = 1;
}

function checkCombinationsNN() {
    if (NNcontrols.w) {
        NN.vx += (2) * Math.cos(NN.rot);
        NN.vy += (2) * Math.sin(NN.rot);
    }
    if (NNcontrols.a) {
        NN.rot += 5 * (Math.PI / 180);
    }
    if (NNcontrols.s) {
        NN.vx -= (3 / 4) * Math.cos(NN.rot);
        NN.vy -= (3 / 4) * Math.sin(NN.rot);NN.rot += 5 * (Math.PI / 180);
    }
    if (NNcontrols.d) {
        NN.rot -= 5 * (Math.PI / 180);
    }
}

function getSurroundings(inputNumber, x, y, rot) {
    // inputNumber is the amount of inputs going
    // into the Nueral Network. The more inputs
    // the better the Nueral Network can understand
    // it's surroundings, but the longer it probably
    // will take to train
    let deg = coterminalAngle(rot);
    let degplus = (360 / (inputNumber - 1)) * Math.PI / 180;
    const result = [];
    for (let i = 0; i < (inputNumber - 1); i++) {
        let closest;
        for (let j = 0; j < lines.length; j++) {
            if (lines[j].goal == false) {
                let slope = Math.tan(deg);
                // console.log(slope);
                // y = m * x + b
                // y = slope * x + b
                // b = slope * x - y
                let b = (slope * x) - y;
                let x2, y2;
                // console.log(deg);
                if (deg < (Math.PI / 2) || deg > ((3 * Math.PI) / 2)) {
                    x2 = x + 100000;
                    y2 = slope * (x + 100000) + b
                } else if (deg > (Math.PI / 2 && deg) < ((3 * Math.PI) / 2)) {
                    x2 = x - 100000;
                    y2 = slope * (x - 100000) + b
                }
                let line = {
                    x1: x,
                    y1: y,
                    x2: x2,
                    y2: y2
                }
                let intercept = intercepting(line, lines[j]);
                let dist = Math.sqrt(((intercept.x - x) ** 2) + ((intercept.y - y) ** 2));
                if ((closest == undefined || dist < closest.d) && intercept.b == true) {
                    closest = {
                        d: dist,
                        x: intercept.x,
                        y: intercept.y
                    };
                }
            } else {
                break;
            }
        }
        if (closest != undefined) {
            result.push(closest);
            // nnctx.beginPath();
            // nnctx.strokeStyle = "grey";
            // nnctx.moveTo(x,y);
            // nnctx.lineTo(closest.x,closest.y);
            // nnctx.stroke();
            // nnctx.closePath();
        } else if (closest == undefined) {
            closest = {
                d: null,
                x: null,
                y: null
            }
            result.push(closest);
        }
        deg += degplus;
        deg = coterminalAngle(deg);
    }
    // get the closest distance from goal
    let goalDist;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].goal == true) {
            let dist = distToSegment(lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2, x, y);
            if ((goalDist == undefined || dist.d < goalDist.d) && dist.d != undefined) {
                goalDist = dist;
            }
        }
    }
    if (goalDist == undefined) {
        goalDist = {
            d: null,
            x: null,
            y: null,
        }
    }
    result.push(goalDist)
    nnctx.beginPath();
    nnctx.strokeStyle = "grey";
    nnctx.moveTo(x, y);
    nnctx.lineTo(goalDist.x, goalDist.y);
    nnctx.stroke();
    nnctx.closePath();
    return result;
}

// filter out everything else but the distances and convert to array
function filterDistances(surroundings) {
    const result = []
    surroundings.forEach((v) => result.push(v.d))
    return result;
}

function collisionHandlerNN(goal) {
    if (goal == true) {
        
    } else {
        NN.x = NN.start.x;
        NN.y = NN.start.y;
        NN.rot = NN.start.rot;
        NN.vx = 0;
        NN.vy = 0;
    }
}