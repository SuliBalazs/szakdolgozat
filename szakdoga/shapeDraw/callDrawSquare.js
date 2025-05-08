const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawSquare(x, y, size, colorshape, lineStyle,fillColor) {
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }

    ctx.strokeStyle=colorshape;
    ctx.rect(x, y, size, size);
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();

    // Szöveg hozzáadása a négyzet közepére
    const centerX = (x+(x+size))/2;
    const centerY = (y+(y+size))/2;
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('360°', centerX, centerY); // Szöveg kiírása a középpontra
    //console.log(x,y,size);
}