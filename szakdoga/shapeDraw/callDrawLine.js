
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawLine(startX, startY, endX, endY, colorshape, lineStyle) {
    //console.log("drawline lefut");
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle=colorshape;
    ctx.stroke();
    ctx.closePath();
}