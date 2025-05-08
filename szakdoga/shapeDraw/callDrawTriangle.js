
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawTriangle(x1, y1, x2, y2, x3, y3, colorshape, lineStyle,fillColor) {
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.closePath();
    ctx.stroke();

    // Szöveg hozzáadása a háromszög közepére
    const centerX = (x1 + x2 + x3) / 3;
    const centerY = (y1 + y2 + y3) / 3;
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('180°', centerX, centerY); // Szöveg kiírása a középpontra
    //console.log("fut");
}