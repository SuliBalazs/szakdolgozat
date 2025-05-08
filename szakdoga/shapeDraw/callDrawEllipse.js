
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawEllipse(centerX, centerY, width, height, colorshape, lineStyle,fillColor) {
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    ctx.ellipse(centerX, centerY, Math.abs(width) / 2, Math.abs(height) / 2, 0, 0, 2 * Math.PI);
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();

    // Szöveg hozzáadása a ellipszis közepére
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('360°', centerX, centerY); // Szöveg kiírása a középpontra
}