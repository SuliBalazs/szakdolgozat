import { drawCircle } from './shapeDraw/callDrawCircle.js';
import { drawLine } from './shapeDraw/callDrawLine.js';
import { drawEllipse } from './shapeDraw/callDrawEllipse.js';
import { drawTriangle } from './shapeDraw/callDrawTriangle.js';
import { drawSquare } from './shapeDraw/callDrawSquare.js';
import { drawRectangle } from './shapeDraw/callDrawRectangle.js';
import { drawPentagon } from './shapeDraw/callDrawPentagon.js';
import { drawHexagon } from './shapeDraw/callDrawhexagon.js';
import { drawOctagon } from './shapeDraw/callDrawOctagon.js';


// A canvas elem lekérése
const canvas = document.getElementById("canvas");
const coordinatesDisplay = document.getElementById('coordinates'); // egér koordinátáihoz
const ctx = canvas.getContext("2d");

let colorshape = '#000000'; // Alapértelmezett fekete szín

// Alapértelmezett vonalstílus
let lineStyle = 'egyenes';
let fillColor = "";

// Az irányítást végző változók
let canvasX = 0;
let canvasY = 0;
const moveDistance = 10; // A mozgás távolsága

let isMouseInsideCanvas = false;//oldal mozgás megakadályozása

canvas.addEventListener("mouseenter", () => {
    isMouseInsideCanvas = true;
});

canvas.addEventListener("mouseleave", () => {
    isMouseInsideCanvas = false;
});

// Gombnyomás eseményfigyelő hozzáadása a dokumentumhoz
document.addEventListener("keydown", handleKeyPress);

//texbox változói:
let isDraggingtext = false;
let dragIndex = -1;
let dragStartX = 0;
let dragStartY = 0;

// Változók az alakzat rajzoláshoz
let isDrawing = false;
let startX, startY, endX, endY;
let drawingMode = "";
let shapes = [];
let currentPath = [];

let customTrianglePoints = [];

//kjelölés változó
let selectedShapeIndex = -1;
let isSelectMode = false;

// The rotation property stores the rotation angle in degrees
shapes.forEach(shape => {
    shape.rotation = 0;
});

// Get the rotation input and button elements
const rotateAngleInput = document.getElementById("rotateAngleInput");
const rotateButton = document.getElementById("rotateButton");
const fillResetButton = document.getElementById("resetFill");

// Event listener for the rotate button click
rotateButton.addEventListener("click", handleRotate);
fillResetButton.addEventListener("click", fillReset);

function fillReset(){
    fillColor = "";
}

//movement
let isDragging = false;
let offsetX, offsetY;
//zoom
let zoomLevel = 1;

//zoom egér save
let zoomedX = 0;
let zoomedY = 0;

//kijelöléshez
function initEventListeners() {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("click", handleSelectModeClick);

// Add event listeners for dragging
    canvas.addEventListener("mousedown", handleDragStart);
    canvas.addEventListener("mousemove", handleDrag);
    canvas.addEventListener("mouseup", handleDragEnd);

    canvas.addEventListener("wheel", handleMouseWheel);


    // Gomb az alakzatok mentéséhez (json)
    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", saveShapes);

    // Fájlkiválasztás eseménykezelője az alakzatok betöltéséhez
    const loadInput = document.getElementById("loadInput");
    loadInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            loadShapes(file);
        }
    });
}

//zoom
function handleMouseWheel(e) {
    if (e.target === canvas) {
        e.preventDefault(); // Megakadályozza a lap görgetését
        const zoomSpeed = 0.1; // Változtathatod a zoom sebességét
        const zoomDelta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;


        zoomLevel += zoomDelta;
        zoomLevel = Math.max(0.1, zoomLevel); // Minimum zoom szint
        zoomLevel = Math.min(5, zoomLevel);   // Maximum zoom szint

        console.log(zoomLevel);
        redrawCanvas();
        displayShapesContent();
    }
}

// Gombnyomás eseménykezelő függvény
function handleKeyPress(e) {
    if(isMouseInsideCanvas) {
        e.preventDefault();
        switch (e.key) {
            case "ArrowUp":
                canvasY += moveDistance;
                break;
            case "ArrowDown":
                canvasY -= moveDistance;
                break;
            case "ArrowRight":
                canvasX -= moveDistance;
                break;
            case "ArrowLeft":
                canvasX += moveDistance;
                break;
        }
    }

    // Frissítjük a vásznat az új pozícióval
    redrawCanvas();
}

// Rajzolási mód beállítása
function setDrawingMode(mode) {
    drawingMode = mode;
    isDrawing = false;
    if (drawingMode === "freehand" || drawingMode === "customTriangle") {
        currentPath = [];
    }
    isSelectMode = drawingMode === "select";
    if (isSelectMode) {
        selectedShapeIndex = -1;
    }
    console.log(drawingMode);
    console.log(shapes);
}
//save gombok 
document.getElementById("simpleSave").addEventListener("click",  () => downloadCanvas()); 
document.getElementById("loadImageButton").addEventListener("click",  () => loadImage());

//alakzatok rajzolásához gombok
document.getElementById("drawLineButton").addEventListener("click", () => setDrawingMode('line'));
document.getElementById("drawCircleButton").addEventListener("click", () => setDrawingMode('circle'));
document.getElementById("drawEllipseButton").addEventListener("click", () => setDrawingMode('ellipse'));
document.getElementById("drawRightTriangleButton").addEventListener("click", () => setDrawingMode('right_triangle'));
document.getElementById("drawCustomTriangleButton").addEventListener("click", () => setDrawingMode('customTriangle'));
document.getElementById("drawSquareButton").addEventListener("click",  () => setDrawingMode('square'));
document.getElementById("drawRectangleButton").addEventListener("click",  () => setDrawingMode('rectangle'));
document.getElementById("drawPentagonButton").addEventListener("click",  () => setDrawingMode('pentagon'));
document.getElementById("drawHexagonButton").addEventListener("click",  () => setDrawingMode('hexagon'));
document.getElementById("drawOctagonButton").addEventListener("click",  () => setDrawingMode('octagon')); 
document.getElementById("drawFreeHandButton").addEventListener("click",  () => setDrawingMode('freehand')); 

//kézi koordinátákkal
document.getElementById("openModalButton").addEventListener("click",  () => openModal());
document.getElementById("drawShapeButton").addEventListener("click",  () => drawShape());

//texts 
document.getElementById("addTextButton").addEventListener("click",  () => addText());
document.getElementById("deleteSelectedTextButton").addEventListener("click",  () => deleteSelectedText());
document.getElementById("addTextButton").addEventListener("click",  () => addText());


//eseménygombok  
document.getElementById("setCoordOnMouseButton").addEventListener("click",  () => setMouseCoord());
document.getElementById("deleteSelectedShapeButton").addEventListener("click",  () => deleteSelectedShape());
document.getElementById("deletByIndexButton").addEventListener("click",  () => deleteShapebyindex());
document.getElementById("deleteAllButton").addEventListener("click",  () => clearCanvas());
document.getElementById("InformationSelectedButton").addEventListener("click",  () => infoAboutSelectedSahape());

//kijelölés
document.getElementById("selectButton").addEventListener("click",  () => setDrawingMode('select'));


function infoAboutSelectedSahape() {
    let lineLength=0;
    const PI = Math.PI;
    let premier=0;
    let area=0;

    if (shapes[selectedShapeIndex].type === "line"){
        //console.log(shapes[selectedShapeIndex]);

        //lineLength = shapes[selectedShapeIndex].startX+shapes[selectedShapeIndex].startY - shapes[selectedShapeIndex].endX - shapes[selectedShapeIndex].endY;
        let linePointsStart = {x : shapes[selectedShapeIndex].startX, y: shapes[selectedShapeIndex].startY};
        let linePointsEnd = {x : shapes[selectedShapeIndex].endX, y: shapes[selectedShapeIndex].endY};

        lineLength=calculateDistance(linePointsStart,linePointsEnd);
        console.log(lineLength);
        if(lineLength<0){
            lineLength=lineLength*-1;
        }
        console.log(lineLength);
    }
    else if (shapes[selectedShapeIndex].type === "circle")
    {
        let circleSugar=shapes[selectedShapeIndex].radius;
        //r*2*PI
        premier=circleSugar*2*PI;
        //r^2*PI
        area=Math.pow(circleSugar,2)*PI;
        console.log("kerület:", premier);
        console.log("területe:", area);
    }
    else if (shapes[selectedShapeIndex].type === "right_triangle")
        {
            let triangleA=0;
            let triangleB=0;
            let triangleC=0;
            
            let pointsToCalculate1 = {x : shapes[selectedShapeIndex].x1, y: shapes[selectedShapeIndex].y1};
            let pointsToCalculate2 = {x : shapes[selectedShapeIndex].x2, y: shapes[selectedShapeIndex].y2};
            let pointsToCalculate3 = {x : shapes[selectedShapeIndex].x3, y: shapes[selectedShapeIndex].y3};

            triangleA = calculateDistance(pointsToCalculate1, pointsToCalculate2) ;//shapes[selectedShapeIndex].x1+shapes[selectedShapeIndex].y1-shapes[selectedShapeIndex].x3-shapes[selectedShapeIndex].y3;
            triangleB = calculateDistance(pointsToCalculate2, pointsToCalculate3)  ;//shapes[selectedShapeIndex].x3+shapes[selectedShapeIndex].y3-shapes[selectedShapeIndex].x2-shapes[selectedShapeIndex].y2;
            triangleC = calculateDistance(pointsToCalculate3, pointsToCalculate1)  ;//shapes[selectedShapeIndex].x1+shapes[selectedShapeIndex].y1-shapes[selectedShapeIndex].x2-shapes[selectedShapeIndex].y2;

            if(triangleA<0){
                triangleA=triangleA*-1;
            }
            if(triangleB<0){
                triangleB=triangleB*-1;
            }
            if(triangleC<0){
                triangleC=triangleC*-1;
            }
            premier=triangleA+triangleB+triangleC;
            area=(triangleA*triangleB)/2;
            //console.log(triangleA,triangleB,triangleC);
            console.log(premier,area);
        }
    else if (shapes[selectedShapeIndex].type === "triangle")
        {
            let triangleA=0;
            let triangleB=0;
            let triangleC=0;
    
            triangleA = calculateDistance(shapes[selectedShapeIndex].points[0], shapes[selectedShapeIndex].points[1]);
            triangleB = calculateDistance(shapes[selectedShapeIndex].points[1], shapes[selectedShapeIndex].points[2]);
            triangleC = calculateDistance(shapes[selectedShapeIndex].points[2], shapes[selectedShapeIndex].points[0]);
            
    
            if(triangleA<0){
                triangleA=triangleA*-1;
            }
            if(triangleB<0){
                triangleB=triangleB*-1;
            }
            if(triangleC<0){
                triangleC=triangleC*-1;
            }
            premier=triangleA+triangleB+triangleC;
            s=(triangleA+triangleB+triangleC)/2;
            area=Math.sqrt(s*(s-triangleA)*(s-triangleB)*(s-triangleC));
            //Math.sqrt(s*(s-triangleA)*(s-triangleB)*(s-triangleC))
            //console.log(triangleA,triangleB,triangleC);
            //console.log(s-triangleA,s-triangleB,s-triangleC,s);
            console.log(premier,area,shapes[selectedShapeIndex].points[0]);
        }
    else if (shapes[selectedShapeIndex].type ==="ellipse")
        {   
            let ellipseAHalf=shapes[selectedShapeIndex].width/2;//tengelyeket meg kell felezni hogy megkapjuk a területet
            let ellipseBHalf=shapes[selectedShapeIndex].height/2;

            area=PI*ellipseAHalf*ellipseBHalf;

            //Rámánudzsan féle kerületszámítás
            premier=PI*(3*(ellipseAHalf+ellipseBHalf)-Math.sqrt((3*ellipseAHalf+ellipseBHalf)*(ellipseAHalf+3*ellipseBHalf)));
        
            console.log("terület: ",area,"kerület: ",premier );
        }
    else if (shapes[selectedShapeIndex].type === "square")
    {
        let squareA=shapes[selectedShapeIndex].size*2;
        area=squareA*squareA;
        premier=4*squareA;
        console.log("terület: ", area, "kerület:", premier);
    }
    else if (shapes[selectedShapeIndex].type === "rectangle")
    {
        let rectangleA=shapes[selectedShapeIndex].height;
        let rectangleB=shapes[selectedShapeIndex].width;

        area=rectangleA*rectangleB;
        premier=2*rectangleA+2*rectangleB;

        console.log("terület: ", area , "kerület:", premier);
    }
    else if (shapes[selectedShapeIndex].type === "pentagon")
    {
        let R=shapes[selectedShapeIndex].size;
        let PentagonA= 2*R*Math.sin(PI/5);

        premier=PentagonA*5;
        area=5 * Math.pow(R, 2) * Math.pow(Math.sin(PI / 5), 2) * (1 / Math.tan(Math.PI / 5));

        console.log("kerület: ",premier, "terület:", area);

    }
    else if (shapes[selectedShapeIndex].type === "hexagon")
        {
            let hexagonA=shapes[selectedShapeIndex].size;
            premier=hexagonA*6;

            area=((3*Math.sqrt(3))/2)*Math.pow(hexagonA, 2);// a többi négyzetes értéket is kicserélni

            console.log("kerület: ",premier,"terület:", area);
    
        }
        else if (shapes[selectedShapeIndex].type === "octagon")
            {
                let radius=shapes[selectedShapeIndex].size;
                // Kerület: K = 16 * R * sin(π/8)
                premier= 16 * radius * Math.sin(PI / 8);
                
                // Terület: T =2*( R^2 * sqrt(2)) 
                area=2*(Math.pow(radius, 2) * Math.sqrt(2));// a többi négyzetes értéket is kicserélni
    
                console.log("kerület: ",premier,"terület:", area);
        
            }
            if(shapes[selectedShapeIndex].type==="line")
            {
            const results = `A vonal hossza: ${lineLength}`;
            document.getElementById('results').textContent = results;
            }else{
            const results = `Kerület: ${premier}, Terület: ${area}`;
            document.getElementById('results').textContent = results;}
            
            
}

// Távolság számító függvény
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Az egérkattintás eseménykezelője
function handleMouseDown(e) {
    isDrawing = true;
    //asdasd
    startX = (e.offsetX / zoomLevel) - canvasX;
    startY = (e.offsetY / zoomLevel) - canvasY;
    endX = e.offsetX- canvasX;
    endY = e.offsetY- canvasY;
    currentPath = [];
    currentPath.push({ x: (e.offsetX / zoomLevel) - canvasX, y: (e.offsetY / zoomLevel) - canvasY });


    if (drawingMode === "customTriangle") {
        customTrianglePoints.push({ x: (e.offsetX / zoomLevel) - canvasX, y: (e.offsetY / zoomLevel) - canvasY });
        if (customTrianglePoints.length === 3) {
            shapes.push({ type: "triangle", points: customTrianglePoints ,colorshape,lineStyle, fillColor});//bármely 3szög feltöltése a shapes tömbbe
            customTrianglePoints = [];
            redrawCanvas();
            displayShapesContent();
        }
    }

}
//movement
//tömb frissítése
function handleDragStart(e) {
    if (isSelectMode && selectedShapeIndex !== -1) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        const shape = shapes[selectedShapeIndex];

        if (shape.type === "line") {
            // For lines, store the offset between the mouse and the closest endpoint
            const distanceToStart = Math.sqrt((mouseX - shape.startX) ** 2 + (mouseY - shape.startY) ** 2);
            const distanceToEnd = Math.sqrt((mouseX - shape.endX) ** 2 + (mouseY - shape.endY) ** 2);

            if (distanceToStart < distanceToEnd  ) {
                offsetX = mouseX - shape.startX;
                offsetY = mouseY - shape.startY;
                console.log(shape.startX);
                
            } 
            else if (distanceToEnd < distanceToStart ) 
                {
                offsetX = mouseX - shape.endX;
                offsetY = mouseY - shape.endY;
                } 

        } else if (
            shape.type === "freehand" ||
            shape.type === "circle" ||
            shape.type === "ellipse" ||
            shape.type === "pentagon" ||
            shape.type === "hexagon" ||
            shape.type === "octagon"
        ) {
// For other shapes, use the center point calculation as before
            const center = getShapeCenter(shape);
            offsetX = mouseX - center.x;
            offsetY = mouseY - center.y;
        }  else if (shape.type === "square" || shape.type === "rectangle") {
// For squares and rectangles, store the offset between the mouse and the top-left corner
            offsetX = mouseX - shape.x;
            offsetY = mouseY - shape.y;
        }else if (shape.type === "triangle") {
            const centroid = getCentroid(shape.points);
            offsetX = mouseX - centroid.x;
            offsetY = mouseY - centroid.y;
        } else if (shape.type === "right_triangle") {
            const centroid = getCentroidRightTriangle(shape);
            offsetX = mouseX - centroid.x;
            offsetY = mouseY - centroid.y;
        }

        isDragging = true;
    }
}



function handleDrag(e) {
    if (isDragging) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        const shape = shapes[selectedShapeIndex];
        

        if (shape.type === "line") {
// For lines, update the position of the closest endpoint based on the mouse movement
            const distanceToStart = Math.sqrt((mouseX - shape.startX) ** 2 + (mouseY - shape.startY) ** 2);
            const distanceToEnd = Math.sqrt((mouseX - shape.endX) ** 2 + (mouseY - shape.endY) ** 2);

            
            if (distanceToStart < distanceToEnd ) {
                shape.startX = mouseX - offsetX;
                shape.startY = mouseY - offsetY;
            } else if(distanceToEnd<distanceToStart ) {
                shape.endX = mouseX - offsetX;
                shape.endY = mouseY - offsetY;
            }
        } else if (
            shape.type === "freehand" ||
            shape.type === "circle" ||
            shape.type === "ellipse" ||
            shape.type === "pentagon" ||
            shape.type === "hexagon" ||
            shape.type === "octagon"


        ) {
// For other shapes, update the position based on the mouse movement
            if (shape.type === "freehand") {
                
// Update all points of the freehand shape based on the mouse movement
                const boundingBox = getBoundingBox(shape.path);
                const deltaX = mouseX - offsetX - boundingBox.x;
                const deltaY = mouseY - offsetY - boundingBox.y;
                shape.path.forEach(point => {
                    point.x += deltaX;
                    point.y += deltaY;
                });
                

            }else {
// For other shapes, update the center point based on the mouse movement
                shape.centerX = mouseX - offsetX;
                shape.centerY = mouseY - offsetY;
                console.log("2", shapes);
                //müködő frissítése a tömbnek
                /*shapes = shapes.map(shape => 
                    shape.id === selectedShapeIndex ? { ...shape, centerX: mouseX - offsetX, centerY: mouseY - offsetY } : shape
                  );*/
                
            }
        } else if(shape.type === "triangle"){
            const centroid = getCentroid(shape.points);
            const deltaX = mouseX - centroid.x;
            const deltaY = mouseY - centroid.y;

            // Update the position of each vertex of the triangle
            /*const triangleUpdatePoints =*/
            shape.points.forEach(point => {
                point.x += deltaX;
                point.y += deltaY;
            });
            //tömb frissítése
            /*shapes = shapes.map(shape => 
                shape.id === selectedShapeIndex ? { ...shape, points: triangleUpdatePoints } : shape
              );*/

        }else if (shape.type === "right_triangle") {
            const centroid = getCentroidRightTriangle(shape);
            const deltaX = mouseX - centroid.x;
            const deltaY = mouseY - centroid.y;

            shape.x1+= deltaX;
            shape.y1+= deltaY;
            shape.x2+= deltaX;
            shape.y2+= deltaY;
            shape.x3+= deltaX;
            shape.y3+= deltaY;

        }
        else if (shape.type === "square" || shape.type === "rectangle") {
// For squares and rectangles, update the position based on the mouse movement
            shape.x = mouseX - offsetX;
            shape.y = mouseY - offsetY;
        }

// Redraw the canvas to reflect the changes
        redrawCanvas();
    }
}


function handleDragEnd() {
    isDragging = false;
}

//helpdrag(centershape)
function getShapeCenter(shape) {
    if (shape.type === "line") {
        return { x: (shape.startX + shape.endX) / 2, y: (shape.startY + shape.endY) / 2 };
    } else if (shape.type === "circle" || shape.type === "ellipse") {
        return { x: shape.centerX, y: shape.centerY };
    } else if (shape.type === "freehand") {
        const boundingBox = getBoundingBox(shape.path);
        return { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
    } else if (shape.type === "triangle") {
        const centroid = getCentroid(shape.points);
        return { x: centroid.x, y: centroid.y };
    } else if (shape.type === "right_triangle") {
        const centroid = getCentroidRightTriangle(shape);
        return { x: centroid.x, y: centroid.y };
    } else if (shape.type === "square") {
        return { x: shape.x + shape.size / 2, y: shape.y + shape.size / 2 };
    } else if (shape.type === "rectangle") {
        return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    } else if (shape.type === "pentagon" || shape.type === "hexagon" || shape.type === "octagon") {
        return { x: shape.centerX, y: shape.centerY };
    }

    return { x: 0, y: 0 };
}

// Az egérmozgás eseménykezelője
function handleMouseMove(e) {
    if (!isDrawing) return;

    //asdasd
    // Számold ki a zoomelt koordinátákat ne essen szét
    zoomedX = e.offsetX / zoomLevel - canvasX;
    zoomedY = e.offsetY / zoomLevel - canvasY;

    if (drawingMode === "freehand") {
        currentPath.push({ x:e.offsetX / zoomLevel - canvasX, y:e.offsetY / zoomLevel - canvasY });
        //redrawCanvas(); // Frissítsük a vásznat a szabadkézi vonal miatt
        drawLine(zoomedX, zoomedY, e.offsetX / zoomLevel - canvasX, e.offsetY / zoomLevel - canvasY);
        displayCanvasContent();
    }



    endX = zoomedX;
    endY = zoomedY;
}

// Az egér felengedése eseménykezelő
// Az egér felengedése eseménykezelő
function handleMouseUp() {
    isDrawing = false;


// Determine the default rotation for the shape (0 degrees)
    const rotation = 0;


// Calculate the radius for the circle
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

// Rajzolás az alakzat hozzáadásával a listához
// Add the shape to the shapes array with the rotation property
    if (drawingMode === "line") {
        shapes.push({ id: shapes.length, type: "line", startX, startY, endX: zoomedX, endY: zoomedY, rotation, colorshape, lineStyle});
    } else if (drawingMode === "circle") {
        shapes.push({ id: shapes.length, type: "circle", centerX: startX, centerY: startY, radius, rotation, colorshape, lineStyle, fillColor });
    } else if (drawingMode === "ellipse") {
        shapes.push({ id: shapes.length, type: "ellipse", centerX: (startX + endX) / 2, centerY: (startY + endY) / 2, width: Math.abs(endX - startX), height: Math.abs(endY - startY), rotation, colorshape, lineStyle, fillColor });
    } else if (drawingMode === "freehand") {
        shapes.push({ id: shapes.length, type: "freehand", path: currentPath, rotation, colorshape, lineStyle });
    } else if (drawingMode === "right_triangle") {
        shapes.push({ id: shapes.length, type: "right_triangle", x1: startX, y1: startY, x2: endX, y2: endY, x3: startX, y3: endY, rotation, colorshape, lineStyle, fillColor });
    } else if (drawingMode === "square") {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "square", x: startX, y: startY, size, rotation, colorshape, lineStyle,fillColor });
    } else if (drawingMode === "rectangle") {
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        shapes.push({ id: shapes.length, type: "rectangle", x: startX, y: startY, width, height, rotation, colorshape, lineStyle,fillColor });
    } else if (drawingMode === "pentagon") {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "pentagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
    } else if (drawingMode === "hexagon") {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "hexagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
    } else if (drawingMode === "octagon") {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "octagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
    }

// Frissítjük a vásznat
    redrawCanvas();
    displayShapesContent();
}


//kijelölés
function handleSelectModeClick(e) {
    if (isSelectMode) {
        const mouseX = (e.offsetX / zoomLevel) - canvasX;
        const mouseY = (e.offsetY / zoomLevel) - canvasY;

        selectedShapeIndex = -1;

// Ellenőrizzük az alakzatokat, hogy melyiket jelöltük ki
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointInsideShape(mouseX, mouseY, shapes[i])) {
                selectedShapeIndex = i;
//redrawCanvas();
//return; // Kilépünk, ha találtunk egy kijelölhető alakzatot
                break;
            }
        }

        redrawCanvas();
    }
}



// Az alakzatok tartalmának megjelenítése a HTML-ben
function displayShapesContent() {
    const shapesJSON = JSON.stringify(shapes, null, 2);
    const shapesContentDiv = document.getElementById("shapesContent");
    shapesContentDiv.innerText = shapesJSON;
}
function displayCanvasContent() {
    const canvasJSON = JSON.stringify(currentPath, null, 2);
    const canvasContentDiv = document.getElementById("current_canvas");
    canvasContentDiv.innerText = canvasJSON;
}
//kijelölés
function isPointInsideShape(pointX, pointY, shape) {
    if (shape.type === "line") {
        const { startX, startY, endX, endY } = shape;
        const tolerance = 5; // You can adjust the tolerance to make it easier or harder to select lines
        const distanceToStart = Math.sqrt((pointX - startX) ** 2 + (pointY - startY) ** 2);
        const distanceToEnd = Math.sqrt((pointX - endX) ** 2 + (pointY - endY) ** 2);
        const lineLength = Math.sqrt((startX - endX) ** 2 + (startY - endY) ** 2);

// Calculate the distance from the point to the line using the formula for the distance between a point and a line segment
        const distanceToLine = Math.abs(
            (endX - startX) * (startY - pointY) - (startX - pointX) * (endY - startY)
        ) / lineLength;

// Check if the point is close enough to the line segment
        return distanceToLine <= tolerance && distanceToStart + distanceToEnd <= lineLength + tolerance;
    } else if (shape.type === "circle") {
        const distance = Math.sqrt((pointX - shape.centerX) ** 2 + (pointY - shape.centerY) ** 2);
        return distance <= shape.radius;
    } else if (shape.type === "ellipse") {
        const xRadius = shape.width / 2;
        const yRadius = shape.height / 2;
        const centerX = shape.centerX;
        const centerY = shape.centerY;
        const normalizedX = (pointX - centerX) / xRadius;
        const normalizedY = (pointY - centerY) / yRadius;
        return normalizedX ** 2 + normalizedY ** 2 <= 1;
    } else if (shape.type === "freehand" || shape.type === "triangle" || shape.type === "right_triangle" || shape.type === "square" || shape.type === "rectangle" || shape.type === "pentagon" || shape.type === "hexagon" || shape.type === "octagon") {
        const path = new Path2D();
        if (shape.type === "freehand") {
            const pathPoints = shape.path;
            path.moveTo(pathPoints[0].x, pathPoints[0].y);
            for (let i = 1; i < pathPoints.length; i++) {
                path.lineTo(pathPoints[i].x, pathPoints[i].y);
            }
        } else if (shape.type === "triangle") {
            const { points } = shape;
            path.moveTo(points[0].x, points[0].y);
            path.lineTo(points[1].x, points[1].y);
            path.lineTo(points[2].x, points[2].y);
            path.closePath();
        } else if (shape.type === "right_triangle") {
            path.moveTo(shape.x1, shape.y1);
            path.lineTo(shape.x2, shape.y2);
            path.lineTo(shape.x3, shape.y3);
            path.closePath();
        } else if ( shape.type === "rectangle") {
            path.rect(shape.x, shape.y, shape.width, shape.height);
        }else if (shape.type === "square") {
            const { x, y, size } = shape;
            return pointX >= x && pointX <= x + size && pointY >= y && pointY <= y + size;
        }else if (shape.type === "pentagon") {
// Check if the point is inside the pentagon
            const size = shape.size;
            const centerX = shape.centerX;
            const centerY = shape.centerY;
            const angleStep = (2 * Math.PI) / 5;
            const radius = size / (2 * Math.cos(angleStep / 2));
            const dx = pointX - centerX;
            const dy = pointY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            return distance <= radius && (angle >= -angleStep && angle <= 2 * Math.PI - angleStep);
        }else if (shape.type === "hexagon") {
// Check if the point is inside the hexagon
            const size = shape.size;
            const centerX = shape.centerX;
            const centerY = shape.centerY;
            const angleStep = (2 * Math.PI) / 6;
            const radius = size / (2 * Math.cos(angleStep / 2));
            const dx = pointX - centerX;
            const dy = pointY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            return distance <= radius && (angle >= -angleStep && angle <= 2 * Math.PI - angleStep);
        }else if (shape.type === "octagon") {
// Check if the point is inside the octagon
            const size = shape.size;
            const centerX = shape.centerX;
            const centerY = shape.centerY;
            const angleStep = (2 * Math.PI) / 8;
            const radius = size / (2 * Math.cos(angleStep / 2));
            const dx = pointX - centerX;
            const dy = pointY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            return distance <= radius && (angle >= -angleStep && angle <= 2 * Math.PI - angleStep);
        }
        return ctx.isPointInPath(path, pointX, pointY);
    }
    return false;
}


// Vászon törlése
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.length = 0;
    texts.length = 0;
    //ide vissza
    currentPath.length = 0;
    customTrianglePoints.length = 0;
    displayShapesContent();
}

//vonalszín
// Eseményfigyelő a színpaletta változására
document.getElementById('szinPaletta').addEventListener('change', (event) => {
    colorshape = event.target.value;
});

//vonaltípus
// Eseményfigyelő az "Egyenes vonal" gombra kattintáskor
document.getElementById('egyenesVonalGomb').addEventListener('click', () => {
    lineStyle = 'egyenes';
});

// Eseményfigyelő a "Szaggatott vonal" gombra kattintáskor
document.getElementById('szaggatottVonalGomb').addEventListener('click', () => {
    lineStyle = 'szaggatott';
});
document.getElementById('fillColorInput').addEventListener('change', (event) => {
    fillColor = event.target.value;
});




// Vonal alakzat rajzolása
/*
function drawLine(startX, startY, endX, endY, colorshape, lineStyle) {
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
}*/

// Kör alakzat rajzolása
/*function drawCircle(centerX, centerY, radius, colorshape, lineStyle, fillColor) {
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
    // Szöveg hozzáadása a kör közepére
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('360°', centerX, centerY); // Szöveg kiírása a középpontra
}*/

// Elipszis alakzat rajzolása
/*function drawEllipse(centerX, centerY, width, height, colorshape, lineStyle,fillColor) {
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
}*/
// Háromszög alakzat rajzolása
/*
function drawTriangle(x1, y1, x2, y2, x3, y3, colorshape, lineStyle,fillColor) {
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

}*/

// Négyzet alakzat rajzolása
/*function drawSquare(x, y, size, colorshape, lineStyle,fillColor) {
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
    console.log(x,y,size);
}*/

// Téglalap alakzat rajzolása
/*function drawRectangle(x, y, width, height, colorshape, lineStyle, fillColor) {
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    ctx.rect(x, y, width, height);
    if(fillColor!=0){
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();

    // Szöveg hozzáadása a téglalap közepére
    const centerX = (x+(x+width))/2;
    const centerY = (y+(y+height))/2;
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('360°', centerX, centerY); // Szöveg kiírása a középpontra
    console.log(x,y,width,height);
}*/

// Ötszög alakzat rajzolása
/*function drawPentagon(centerX, centerY, size, colorshape, lineStyle,fillColor) {
    const sides = 5;
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    for (let i = 0; i < sides; i++) {
        const angle = i * (2 * Math.PI / sides) - Math.PI / 2;
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

    // Szöveg hozzáadása az ötszög közepére
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('540°', centerX, centerY); // Szöveg kiírása a középpontra
}*/

// Hatágú alakzat rajzolása
/*function drawHexagon(centerX, centerY, size, colorshape, lineStyle,fillColor) {
    const sides = 6;
    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    for (let i = 0; i < sides; i++) {
        const angle = i * (2 * Math.PI / sides) - Math.PI / 2;
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

    // Szöveg hozzáadása a hatszög közepére
    ctx.font = '16px Arial'; // Betűtípus és méret beállítása
    ctx.fillStyle = 'black'; // Szöveg színe
    ctx.textAlign = 'center'; // Szöveg igazítása vízszintesen középre
    ctx.textBaseline = 'middle'; // Szöveg igazítása függőlegesen középre
    ctx.fillText('720°', centerX, centerY); // Szöveg kiírása a középpontra
}*/

// Nyolctágú alakzat rajzolása
/*function drawOctagon(centerX, centerY, size, colorshape, lineStyle,fillColor) {
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
}*/


// Szabadkézi vonalak rajzolása
function drawFreehand(path,colorshape, lineStyle) {
    if (path.length < 2) return;

    ctx.beginPath();
    if (lineStyle === 'szaggatott') {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]); // Alapértelmezett: egyenes vonal
    }
    ctx.strokeStyle=colorshape;
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
        ctx.lineTo(path[i].x, path[i].y)
    }

    ctx.stroke();
    ctx.closePath();
}
// Az alakzatok újrarajzolása
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //szövegkiírás miatt kommentben
    ctx.scale(zoomLevel, zoomLevel); // Zoom alkalmazása
    //szöveg
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    for (let text of texts) {
        ctx.fillText(text.text, text.x, text.y);
    }

    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const isSelected = i === selectedShapeIndex;

        ctx.save();

//if (isSelected) {
        const angle = (shape.rotation * Math.PI) / 180;
        let centerX, centerY;

// Calculate the center point based on the shape type
        if (shape.type === "line") {
            centerX = (shape.startX + shape.endX) / 2;
            centerY = (shape.startY + shape.endY) / 2;
        } else if (shape.type === "circle") {
            centerX = shape.centerX;
            centerY = shape.centerY;
        } else if (shape.type === "ellipse") {
            centerX = shape.centerX;
            centerY = shape.centerY;
        } else if (shape.type === "freehand") {
            const boundingBox = getBoundingBox(shape.path);
            centerX = boundingBox.x + boundingBox.width / 2;
            centerY = boundingBox.y + boundingBox.height / 2;
        } else if (shape.type === "triangle") {
            const centroid = getCentroid(shape.points);
            centerX = centroid.x;
            centerY = centroid.y;
        } else if (shape.type === "right_triangle") {
            const centroid = getCentroidRightTriangle(shape);
            centerX = centroid.x;
            centerY = centroid.y;
        }else if (shape.type === "square") {
            centerX = shape.x + shape.size / 2;
            centerY = shape.y + shape.size / 2;
        } else if (shape.type === "rectangle") {
// Calculate the center based on the rectangle's properties
            centerX = shape.x + shape.width / 2;
            centerY = shape.y + shape.height / 2;
        } else if (
            shape.type === "pentagon" ||
            shape.type === "hexagon" ||
            shape.type === "octagon"
        ) {
// For these shapes, use the center point as the center
            centerX = shape.centerX;
            centerY = shape.centerY;
        }

// Translate and rotate the canvas around the center point
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

// Update the rotation in the shapes array
        shapes[i].rotation = shape.rotation;



//}

        ctx.strokeStyle = isSelected ? "red" : "black";
        ctx.lineWidth = isSelected ? 3 : 1;



// Draw the shape based on its type
        if (shape.type === "line") { 
            drawLine(shape.startX - canvasX, shape.startY - canvasY, shape.endX - canvasX, shape.endY - canvasY, shape.colorshape, shape.lineStyle);
        } else if (shape.type === "circle") {
            drawCircle(shape.centerX + canvasX, shape.centerY + canvasY, shape.radius, shape.colorshape, shape.lineStyle,shape.fillColor);
        } else if (shape.type === "ellipse") {
            drawEllipse(shape.centerX + canvasX, shape.centerY + canvasY, shape.width, shape.height, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "freehand") {
            const shiftedPath = shape.path.map(point => ({ x: point.x + canvasX, y: point.y + canvasY }));
            drawFreehand(shiftedPath, shape.colorshape,shape.lineStyle);
        } else if (shape.type === "triangle") {
            drawTriangle(
                shape.points[0].x+canvasX,
                shape.points[0].y+ canvasY,
                shape.points[1].x+canvasX,
                shape.points[1].y+ canvasY,
                shape.points[2].x+canvasX,
                shape.points[2].y+ canvasY,
                shape.colorshape,
                shape.lineStyle,
                shape.fillColor
            );
        } else if (shape.type === "right_triangle") {
            drawTriangle(shape.x1+canvasX, shape.y1+ canvasY, shape.x2+canvasX, shape.y2+ canvasY, shape.x3+canvasX, shape.y3+ canvasY, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "square") {
            drawSquare(shape.x+canvasX, shape.y+ canvasY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "rectangle") {
            drawRectangle(shape.x+canvasX, shape.y+ canvasY, shape.width, shape.height, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "pentagon") {
            drawPentagon(shape.centerX+canvasX, shape.centerY+ canvasY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "hexagon") {
            drawHexagon(shape.centerX+canvasX, shape.centerY+ canvasY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
        } else if (shape.type === "octagon") {
            drawOctagon(shape.centerX+canvasX, shape.centerY+ canvasY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
        }
        ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Helper function to calculate the bounding box of a path
function getBoundingBox(path) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of path) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Helper function to calculate the centroid of a triangle
function getCentroid(points) {
    const centerX = (points[0].x + points[1].x + points[2].x) / 3;
    const centerY = (points[0].y + points[1].y + points[2].y) / 3;
    return { x: centerX, y: centerY };
}
// Helper function to calculate the centroid of a right triangle
function getCentroidRightTriangle(shape) {
    const centerX = (shape.x1 + shape.x2 + shape.x3) / 3;
    const centerY = (shape.y1 + shape.y2 + shape.y3) / 3;
    return { x: centerX, y: centerY };
}



initEventListeners();
function handleRotate() {
    if (selectedShapeIndex !== -1) {
// Get the selected shape
        const shape = shapes[selectedShapeIndex];

// Get the rotation angle from the input
        const angle = parseInt(rotateAngleInput.value);

// Store the rotation angle in the shape object
        shape.rotation = angle;

// Redraw the canvas to reflect the changes
        redrawCanvas();
    }
}
// Function to delete the selected shape
function deleteSelectedShape() {
    if (selectedShapeIndex !== -1) {
        // Remove the selected shape from the shapes array
        shapes.splice(selectedShapeIndex, 1);
        selectedShapeIndex = -1;

        // Redraw the canvas to reflect the changes
        redrawCanvas();
        displayShapesContent();
        displayCanvasContent()
    }
}
// Az alakzatok törlése
function deleteShapebyindex() {
    const deleteIndexInput = document.getElementById("deleteIndexInput");
    const deleteIndex = parseInt(deleteIndexInput.value);

    if (deleteIndex >= 0 && deleteIndex < shapes.length) {
        shapes.splice(deleteIndex, 1); // Töröljük az adott indexű alakzatot a tömbből
        selectedShapeIndex = -1; // Töröljük a kijelölést
        redrawCanvas(); // Rajzoljuk újra a vásznat
    } else {
        alert("Érvénytelen index!");
    }
    displayShapesContent();
    displayCanvasContent()
}

// Rajz letöltése
function downloadCanvas() {
    const canvas = document.getElementById("canvas");
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "rajz.png";
    link.click();
}


// Rajz betöltése
function loadImage() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const image = new Image();
            image.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0);
            };
            image.src = event.target.result;
        };

        reader.readAsDataURL(file);
    }
}
//texboxhoz
const texts = [];

function addText() {
    isDrawing = false;
    const textInput = document.getElementById('textInput');
    const newText = {
        text: textInput.value,
        x: canvas.width / 2, // Kezdőpozíció a Canvas közepén
        y: canvas.height / 2,
    };
    texts.push(newText);

}

//text boxhoz
canvas.addEventListener('mousedown', function(e) {
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;
    isDraggingtext = true;
    for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        const textWidth = ctx.measureText(text.text).width;
        const textHeight = 20; // Beállíthatod a szöveg méretét
        if (mouseX >= text.x && mouseX <= text.x + textWidth && mouseY >= text.y - textHeight && mouseY <= text.y) {
            dragIndex = i;
            dragStartX = mouseX - text.x;
            dragStartY = mouseY - text.y;
            break;
        }
    }

});

canvas.addEventListener('mousemove', function(e) {
    if (isDraggingtext && dragIndex !== -1) {
        const mouseX = e.clientX - canvas.offsetLeft;
        const mouseY = e.clientY - canvas.offsetTop;
        texts[dragIndex].x = mouseX - dragStartX;
        texts[dragIndex].y = mouseY - dragStartY;
        redrawCanvas();
    }
    redrawCanvas();

});

canvas.addEventListener('mouseup', function(e) {
    isDraggingtext = false;
    dragIndex = -1;

});

function deleteSelectedText() {
    // Remove the selected shape from the shapes array
    texts.splice(selectedShapeIndex, 1);
    selectedShapeIndex = -1;

    // Redraw the canvas to reflect the changes
    redrawCanvas();
    displayShapesContent();
    displayCanvasContent();
}

redrawCanvas();

function openModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

function drawShape() {

    const shapeSelect = document.getElementById('shape');
    const selectedShape = shapeSelect.value;
    const startX = parseInt(document.getElementById('startX').value);
    const startY = parseInt(document.getElementById('startY').value);
    const endX = parseInt(document.getElementById('endX').value);
    const endY = parseInt(document.getElementById('endY').value);

    const point3X = parseInt(document.getElementById('point3X').value);
    const point3Y = parseInt(document.getElementById('point3Y').value);

    // Calculate the radius for the circle
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    // Add a rotation property to each shape in the shapes array
    // The rotation property stores the rotation angle in degrees
    shapes.forEach(shape => {
        shape.rotation = 0;
    });
    // Determine the default rotation for the shape (0 degrees)
    const rotation = 0;


    if (selectedShape === 'line') {
        shapes.push({ id: shapes.length, type: "line", startX, startY, endX, endY, colorshape, lineStyle});
        drawLine(shape.startX, shape.startY, shape.endX, shape.endY, shape.colorshape, shape.lineStyle);
    } else if (selectedShape === 'circle') {
        shapes.push({ id: shapes.length, type: "circle", centerX: startX, centerY: startY, radius, rotation, colorshape, lineStyle, fillColor });
        drawCircle(shape.centerX, shape.centerY, shape.radius, shape.colorshape, shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'ellipse') {
        shapes.push({ id: shapes.length, type: "ellipse", centerX: (startX + endX) / 2, centerY: (startY + endY) / 2, width: Math.abs(endX - startX), height: Math.abs(endY - startY), rotation, colorshape, lineStyle, fillColor });
        drawEllipse(shape.centerX, shape.centerY, shape.width, shape.height, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'right_triangle') {
        shapes.push({ id: shapes.length, type: "right_triangle", x1: startX, y1: startY, x2: endX, y2: endY, x3: startX, y3: endY, rotation, colorshape, lineStyle, fillColor });
        drawTriangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.x3, shape.y3, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'triangle') {
        shapes.push({ id: shapes.length, type: "right_triangle", x1: startX, y1: startY, x2: endX, y2: endY, x3: point3X, y3: point3Y, rotation, colorshape, lineStyle, fillColor });//bármely 3szög feltöltése a shapes tömbbe
        drawTriangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.x3, shape.y3, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'square') {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "square", x: startX, y: startY, size, rotation, colorshape, lineStyle,fillColor });
        drawSquare(shape.x, shape.y, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'rectangle') {
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        shapes.push({ id: shapes.length, type: "rectangle", x: startX, y: startY, width, height, rotation, colorshape, lineStyle,fillColor });
        drawRectangle(shape.x, shape.y, shape.width, shape.height, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'pentagon') {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "pentagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
        drawPentagon(shape.centerX, shape.centerY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'hexagon') {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "hexagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
        drawHexagon(shape.centerX, shape.centerY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
    }
    if (selectedShape === 'octagon') {
        const size = Math.abs(endX - startX);
        shapes.push({ id: shapes.length, type: "octagon", centerX: startX, centerY: startY, size, rotation, colorshape, lineStyle,fillColor });
        drawOctagon(shape.centerX, shape.centerY, shape.size, shape.colorshape,shape.lineStyle,shape.fillColor);
    }

    closeModal();
}

// Alakzatok mentése a localStorage-ba (dfx)
function saveShapesToLocalStorage() {
    const shapesJSON = JSON.stringify(shapes);
    localStorage.setItem("shapes", shapesJSON);
}

// Alakzatok betöltése a localStorage-ból
function loadShapesFromLocalStorage() {
    const shapesJSON = localStorage.getItem("shapes");
    if (shapesJSON) {
        shapes = JSON.parse(shapesJSON);
        redrawCanvas();
        displayShapesContent();
    }
}

// Alkalmazás inicializálása, ide érdemes hívni a loadShapesFromLocalStorage függvényt
function initApp() {
    loadShapesFromLocalStorage();
    initEventListeners();
}

// Alakzatok mentése a localStorage-ba például egy gombnyomásra
const saveButton = document.getElementById("saveButton"); // Az "Mentés" gombra hivatkozás
saveButton.addEventListener("click", saveShapesToLocalStorage);

// Alkalmazás inicializálása
initApp();

// Funkció az alakzatok mentésére
function saveShapes() {
    const shapesJSON = JSON.stringify(shapes);
    const blob = new Blob([shapesJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shapes.json";
    a.click();

    URL.revokeObjectURL(url);
}

// Funkció az alakzatok betöltésére
function loadShapes(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const shapesJSON = event.target.result;
        shapes = JSON.parse(shapesJSON);
        redrawCanvas();
        displayShapesContent();
    };
    reader.readAsText(file);
}
let isButtonForMouseCoordOn = false;
/*toggleButtonForMouseCoord.addEventListener('click', () => {
    
    isButtonForMouseCoordOn = !isButtonForMouseCoordOn;

    console.log(isButtonForMouseCoordOn);
})*/
function setMouseCoord() {
    isButtonForMouseCoordOn = !isButtonForMouseCoordOn;

    console.log(isButtonForMouseCoordOn);
}

canvas.addEventListener('mousemove', (event) =>{
    
    const coordRect = canvas.getBoundingClientRect();
    const x = event.clientX - coordRect.left;
    const y = event.clientY - coordRect.top;

    // Koordináták megjelenítése az egér mellett
    coordinatesDisplay.textContent = `Koordináták: (${Math.round(x)}, ${Math.round(y)})`;

    if (isButtonForMouseCoordOn){
    coordinatesDisplay.style.left = `${event.pageX + 10}px`;  // Az egér kurzor mellett jelenik meg (10px távolságra)
    coordinatesDisplay.style.top = `${event.pageY + 10}px`;
    }
    else{
        coordinatesDisplay.style.left = `${ 10}px`;  // Az egér kurzor mellett jelenik meg (10px távolságra)
    coordinatesDisplay.style.top = `${10}px`;
    }
    

    // Rajzolás a canvason (opcionális)
    ctx.fillStyle = 'blue';
    ctx.fillRect(x - 4, y - 4, 8, 8); // Rajzolj egy kék négyzetet az egér fölött

} )


