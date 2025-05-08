
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function drawOctagon(centerX, centerY, size, colorshape, lineStyle,fillColor) {
    const sides = 8;
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    for (let i = 0; i < sides; i++) {
        const angle = i * (2 * Math.PI / sides) - Math.PI / 8;
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.closePath();
    ctx.stroke();

    // Szöveg hozzáadása a nyolcszög közepére
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('1080°', centerX, centerY); // Szöveg kiírása a középpontra
}