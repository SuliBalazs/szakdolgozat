// callDrawCircle.js
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawCircle( centerX, centerY, radius, colorshape, lineStyle, fillColor) {
    ctx.beginPath();
    
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Default to a solid line
    }
    ctx.strokeStyle = colorshape;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    
    ctx.stroke();
    ctx.closePath();

    // Optional text in the circle's center
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('360°', centerX, centerY);
    
}