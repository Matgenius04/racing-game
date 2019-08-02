function getFormula(line) {
    let slope = (line.y2 - line.y1)/(line.x2 - line.x1);
    // y = mx + b
    // y = slope * x + b
    // y1 = slope * x1 + b
    // y1 - slope * x1 = b
    let intercept = line.y1 - (line.x1 * slope);
    return {m: slope, b: intercept};
}

function intercepting(line1,line2) {
    let intercept = true;
    // get formulas of both lines
    let l1 = getFormula(line1);
    let l2 = getFormula(line2);
    // check their intersection
    // l1.m * x + l1.b = l2.m * x + l2.b
    // (l1.m - l2.m) * x = l2.b - l1.b
    let x = (l2.b - l1.b)/(l1.m - l2.m);
    // bring x back in
    let y = l1.m * x + l1.b;
    // for testing draw intersecting points
    // ctx.beginPath();
    // ctx.arc(x,y,10,0,2*Math.PI);
    // ctx.closePath();
    // ctx.fill();
    //
    let minX1 = Math.min(line1.x1,line1.x2,x),
    maxX1 = Math.max(line1.x1,line1.x2,x),
    minX2 = Math.min(line2.x1,line2.x2,x),
    maxX2 = Math.max(line2.x1,line2.x2,x);
    if (minX1 == x || maxX1 == x || minX2 == x || maxX2 == x) {
        intercept = false;
    }
    return {b:intercept,x:x,y:y};
}