function getFormula(line) {
    let intercept;
    let slope;
    if (line.x1 == line.x2) {
        slope = null;
        intercept = line.x1;
    } else {
        slope = (line.y2 - line.y1)/(line.x2 - line.x1);
        // y = mx + b
        // y = slope * x + b
        // y1 = slope * x1 + b
        // y1 - slope * x1 = b
        intercept = line.y1 - (line.x1 * slope);
    }
    return {m: slope, b: intercept};
}

function intercepting(line1,line2) {
    let intercept = true;
    // get formulas of both lines
    let l1 = getFormula(line1),
    l2 = getFormula(line2);
    let x,y;
    if (l1.m == null) {
        // let x = the x intercept
        x = l1.b;
        // bring x into
        // y = l2.m * x + l2.b
        y = l2.m * x + l2.b;
        // define ranges and detect if x and/or y is out of the ranges
        let minY1 = Math.min(line1.y1,line1.y2,y),
        maxY1 = Math.max(line1.y1,line1.y2,y),
        minX2 = Math.min(line2.x1,line2.x2,x),
        maxX2 = Math.max(line2.x1,line2.x2,x),
        minY2 = Math.min(line2.y1,line2.y2,y),
        maxY2 = Math.max(line2.y1,line2.y2,y);
        // if the intersecting y is within both of the lines max and min y
        // and if the intersecting x is within the 2nd line intercept is true
        if (minY1 == y || maxY1 == y || minX2 == x
        || maxX2 == x || minY2 == y || maxY2 == y) {
            intercept = false;
        }
    } else if (l2.m == null) {
        // let x = the x intercept
        x = l2.b;
        // bring x into
        // y = l2.m * x + l2.b
        y = l1.m * x + l1.b;
        // define ranges and detect if x and/or y is out of the ranges
        let minX1 = Math.min(line1.x1,line1.x2,x),
        maxX1 = Math.max(line1.x1,line1.x2,x),
        minY1 = Math.min(line1.y1,line1.y2,y),
        maxY1 = Math.max(line1.y1,line1.y2,y),
        minY2 = Math.min(line2.y1,line2.y2,y),
        maxY2 = Math.max(line2.y1,line2.y2,y);
        // if the intersecting y is within both of the lines max and min y
        // and if the intersecting x is within the 2nd line intercept is true
        if (minX1 == x || maxX1 == x || minY1 == y
        || maxY1 == y || minY2 == y || maxY2 == y) {
            intercept = false;
        }
    } else if ((l1.m == null && l2.m == null) || l1.m == l2.m) {
        if (l1.b == l2.b) {
            intercept = true;
        } else {
            intercept = false;
        }
    } else {
        // check their intersection
        // l1.m * x + l1.b = l2.m * x + l2.b
        // (l1.m - l2.m) * x = l2.b - l1.b
        x = (l2.b - l1.b)/(l1.m - l2.m);
        // bring x back in
        y = l1.m * x + l1.b;
        // define ranges and detect if x is out of the ranges
        let minX1 = Math.min(line1.x1,line1.x2,x),
        maxX1 = Math.max(line1.x1,line1.x2,x),
        minX2 = Math.min(line2.x1,line2.x2,x),
        maxX2 = Math.max(line2.x1,line2.x2,x);
        if (minX1 == x || maxX1 == x || minX2 == x || maxX2 == x) {
            intercept = false;
        }
    }
    // for testing draw intersecting points
    // ctx.beginPath();
    // ctx.arc(x,y,10,0,2*Math.PI);
    // ctx.closePath();
    // ctx.fill();
    
    return {b:intercept,x:x,y:y};
}
function perpendicular(formula) {
    return {m:-1/formula.m,b:formula.b};
}
function coterminalAngle(rad) {
    while (rad < 0) {
        rad += 2 * Math.PI;
    }
    return rad % (2 * Math.PI);
}
// where x1,y1,x2 and y2 are the points of the line segment
// this is based on http://paulbourke.net/geometry/pointlineplane/
// and https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function distToSegment(x1,y1,x2,y2,x3,y3) {
    if (distSqr(x2,y2,x1,y1) == 0) {
        return {d: distSqr(x3,y3,x1,y1), x:x1, y:y1};
    }
    let u = (((x3 - x1) * (x2 - x1)) + ((y3 - y1) * (y2 - y1))) / (distSqr(x2,y2,x1,y1));
    u = Math.max(0, Math.min(1,u));
    let x = x1 + (u * (x2 - x1));
    let y = y1 + (u * (y2 - y1));
    let dist = Math.sqrt(distSqr(x,y,x3,y3));
    return {
        d: dist,
        x: x,
        y: y
    }
}
function distSqr(x1,y1,x2,y2) {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
}