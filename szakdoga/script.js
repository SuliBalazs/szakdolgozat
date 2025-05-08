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
                canvasY -= moveDistance;
                break;
            case "ArrowDown":
                canvasY += moveDistance;
                break;
            case "ArrowRight":
                canvasX += moveDistance;
                break;
            case "ArrowLeft":
                canvasX -= moveDistance;
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
document.getElementById("showPremierAndAreaButton").addEventListener("click",  () => showPremierAndArea()); 
document.getElementById("showEasyTaskButton").addEventListener("click",  () => showNewTask("easy"));
document.getElementById("showMediumTaskButton").addEventListener("click",  () => showNewTask("medium"));  
document.getElementById("checkTaskButton").addEventListener("click",  () => checkTask());
document.getElementById("showTaskMenu").addEventListener("click",  () => toggleDropdown()); 
document.getElementById("showformulaButton").addEventListener("click",  () => showformula());


//kijelölés
document.getElementById("selectButton").addEventListener("click",  () => setDrawingMode('select'));

let lineLength=0;
const PI = Math.PI;
let premier=0;
let area=0;

let circleSugar=0;

let ellipseAHalf= 0;
let ellipseBHalf= 0;

let triangleA=0;
let triangleB=0;
let triangleC=0;
let s=0; //sima hárömszög válltozója

let squareA=0; // négyzet

let rectangleA=0;
let rectangleB=0;

let R=0; // ötszög köré írt kör sugara
let PentagonA= 0; // az ötszög oldalainak hossza

let hexagonA=0;
let octagonA=0;
let octagonRadius=0;

function infoAboutSelectedSahape() {
       
            /*if (shapes[selectedShapeIndex].type!="line")
            {
                const results = `Kerület: ${premier}, Terület: ${area}`;
                alert(results);
            }*/ 
            if(selectedShapeIndex===-1)
            {
                    const results = `nincsen kijelölt elem`;
                    showModal(results); 
            } else if (shapes[selectedShapeIndex].type === "line") {
                calculateShapesData(selectedShapeIndex); 
                const results = `A vonal hossza: ${lineLength}`;
                showModal(results);
            } else if (shapes[selectedShapeIndex].type === "circle") {
                calculateShapesData(selectedShapeIndex); 
                const results = `sugara: ${circleSugar}`;
                showModal(results);
            } else if (shapes[selectedShapeIndex].type === "ellipse") {
                calculateShapesData(selectedShapeIndex); 
                const results = `szélesség: ${ellipseAHalf}, magasság: ${ellipseBHalf} `;
                showModal(results);
            }   else if (shapes[selectedShapeIndex].type === "triangle" || shapes[selectedShapeIndex].type === "right_triangle"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${triangleA}, B oldal: ${triangleB}, C oldal: ${triangleC}`;
                showModal(results);
            } else if (shapes[selectedShapeIndex].type === "square"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${squareA}, B oldal: ${squareA}`;
                showModal(results);
            }  else if(shapes[selectedShapeIndex].type === "rectangle"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${rectangleA}, B oldal: ${rectangleB}`;
                showModal(results);
            }  else if(shapes[selectedShapeIndex].type === "pentagon"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${PentagonA}, Az ötszög köré írt kör sugara: ${R}`;
                showModal(results);
            } else if(shapes[selectedShapeIndex].type === "hexagon"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${hexagonA}`;
                showModal(results);
            } else if(shapes[selectedShapeIndex].type === "octagon"){
                calculateShapesData(selectedShapeIndex); 
                const results = `A oldal: ${octagonA}, Az ötszög köré írt kör sugara: ${octagonRadius}`;
                showModal(results);
            } else {
                const results = `nincsen kijelölt elem`;
                showModal(results);
            }
                    
}
function showPremierAndArea(){
    
    if(selectedShapeIndex===-1)
    {
        const results = `nincsen kijelölt elem`;
        showModal(results); 
    } else if (shapes[selectedShapeIndex].type === "line") {
        calculateShapesData(selectedShapeIndex);
        const results = `A vonal hossza: ${lineLength}`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "circle" || shapes[selectedShapeIndex].type === "ellipse") {
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    }   else if (shapes[selectedShapeIndex].type === "triangle" || shapes[selectedShapeIndex].type === "right_triangle"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "square"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    }  else if(shapes[selectedShapeIndex].type === "rectangle"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    }  else if(shapes[selectedShapeIndex].type === "pentagon"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    }else if(shapes[selectedShapeIndex].type === "hexagon"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    }else if(shapes[selectedShapeIndex].type === "octagon"){
        calculateShapesData(selectedShapeIndex);
        const results = `Kerülete: ${premier}, Területe: ${area}`;
        showModal(results);
    } else {
        const results = `nincsen kijelölt elem`;
        showModal(results);
    }
}
function showformula(){

    if (selectedShapeIndex===-1)
    {
        const results = `nincsen kijelölt elem`;
        showModal(results); 
    }else if (shapes[selectedShapeIndex].type === "line"){

        const results = `A Kijelölt elem egy vonal`;
        showModal(results);
    }  else if (shapes[selectedShapeIndex].type === "circle"){

            const results = `A Kör kerülete: r*2*PI, Területe:rˇ2*PI`;
            showModal(results);
    } else if(shapes[selectedShapeIndex].type === "right_triangle"){

        const results = `A derékszögű háromszög kerülete: A+B+C, Területe:(A*B)/2`;
        showModal(results);
    } else if(shapes[selectedShapeIndex].type === "triangle"){
        const results = `A háromszög kerülete: A+B+C, Területe: s=(A+B+C)/2, T=s*(s-A)*(s-B)*(s-c)`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type ==="ellipse"){   
        const results = `Az ellipszis kerülete(magasság=A szélesség=B): PI*A*B, Területe: PI*(3*(A+B)-(3*A+B)*(A+3*B))`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "square")
    {
        const results = `A négyzet kerülete: 4*A , Területe:A*A`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "rectangle")
    {
        const results = `A téglalap kerülete: 2*A+2*B , Területe:A*B`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "pentagon")
    {
        const results = `A pentagon kerülete: 5*A , Területe (a köréírható kör sugara=r): 5*r^2*(sin(PI/5))ˇ2*(1/tan(PI/5))`;
        showModal(results);
    } else if (shapes[selectedShapeIndex].type === "hexagon")
    {
        const results = `A hexagon kerülete: 6*A , Területe : ((3*√3)/2)*a2`;
        showModal(results);
    } else if(shapes[selectedShapeIndex].type === "octagon")
    {
        const results = `A octagon kerülete: 8*A , Területe (az r a köréírható kör sugara): 2*(rˇ2)*√2`;
        showModal(results);
    } else {
        const results = `nincsen kijelölt elem`;
        showModal(results);
    }

}
// Távolság számító függvény
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function calculateShapesData(index){ //megadott indexet kér hogy melyik shape-et kezelje
    console.log("fut");
    const descaleNumbers=20;
    if (shapes[index].type === "line"){
        console.log("fut vonal");
        //console.log(shapes[selectedShapeIndex]);

        //lineLength = shapes[selectedShapeIndex].startX+shapes[selectedShapeIndex].startY - shapes[selectedShapeIndex].endX - shapes[selectedShapeIndex].endY;
        let linePointsStart = {x : shapes[index].startX, y: shapes[index].startY};
        let linePointsEnd = {x : shapes[index].endX, y: shapes[index].endY};

        lineLength=Math.round((calculateDistance(linePointsStart,linePointsEnd))/descaleNumbers);
        console.log(lineLength);
        if(lineLength<0){
            lineLength=lineLength*-1;
        }
    }
    else if (shapes[index].type === "circle")
    {  console.log("fut kör");
        circleSugar=Math.round(((shapes[index].radius))/descaleNumbers);
        //r*2*PI
        premier=circleSugar*2*PI;
        //r^2*PI
        area=Math.pow(circleSugar,2)*PI;
    }
    else if (shapes[index].type === "right_triangle")
        {
            let changehelp=0;
            let pointsToCalculate1 = {x : shapes[index].x1, y: shapes[index].y1};
            let pointsToCalculate2 = {x : shapes[index].x2, y: shapes[index].y2};
            let pointsToCalculate3 = {x : shapes[index].x3, y: shapes[index].y3};

            triangleA = Math.round((calculateDistance(pointsToCalculate1, pointsToCalculate2))/descaleNumbers); //shapes[selectedShapeIndex].x1+shapes[selectedShapeIndex].y1-shapes[selectedShapeIndex].x3-shapes[selectedShapeIndex].y3;
            triangleB = Math.round((calculateDistance(pointsToCalculate2, pointsToCalculate3))/descaleNumbers); //shapes[selectedShapeIndex].x3+shapes[selectedShapeIndex].y3-shapes[selectedShapeIndex].x2-shapes[selectedShapeIndex].y2;
            triangleC = Math.round((calculateDistance(pointsToCalculate3, pointsToCalculate1))/descaleNumbers); //shapes[selectedShapeIndex].x1+shapes[selectedShapeIndex].y1-shapes[selectedShapeIndex].x2-shapes[selectedShapeIndex].y2;

            if(triangleA<0){
                triangleA=triangleA*-1;
            }
            if(triangleB<0){
                triangleB=triangleB*-1;
            }
            if(triangleC<0){
                triangleC=triangleC*-1;
            }
            if(triangleA>triangleC) // hogy mindíg az átfogó legyen a c oldal
            {
                changehelp=triangleA;
                triangleA=triangleC;
                triangleC=changehelp;
            }
            if(triangleB>triangleC)
            {
                changehelp=triangleB;
                triangleB=triangleC;
                triangleC=changehelp;
            }
            premier=triangleA+triangleB+triangleC;
            area=(triangleA*triangleB)/2;
            //console.log(triangleA,triangleB,triangleC);
        }
    else if (shapes[index].type === "triangle")
        {
            
            triangleA = Math.round((calculateDistance(shapes[index].points[0], shapes[index].points[1]))/descaleNumbers);
            triangleB = Math.round((calculateDistance(shapes[index].points[1], shapes[index].points[2]))/descaleNumbers);
            triangleC = Math.round((calculateDistance(shapes[index].points[2], shapes[index].points[0]))/descaleNumbers);
            
    
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
            console.log(premier,area,shapes[index].points[0]);
        }
    else if (shapes[index].type ==="ellipse")
        {   
            ellipseAHalf=Math.round((shapes[index].width/2)/descaleNumbers);//tengelyeket meg kell felezni hogy megkapjuk a területet
            ellipseBHalf=Math.round((shapes[index].height/2)/descaleNumbers);

            area=PI*ellipseAHalf*ellipseBHalf;

            //Rámánudzsan féle kerületszámítás
            premier=Math.sqrt(PI*(3*(ellipseAHalf+ellipseBHalf)-(3*ellipseAHalf+ellipseBHalf)*(ellipseAHalf+3*ellipseBHalf)));
        
            //console.log("terület: ",area,"kerület: ",premier );
        }
    else if (shapes[index].type === "square")
    {
        squareA=Math.round(((shapes[index].size*2))/descaleNumbers);
        area=squareA*squareA;
        premier=4*squareA;
        console.log("jaj");

        //console.log("terület: ", area, "kerület:", premier);
    }
    else if (shapes[index].type === "rectangle")
    {
        rectangleA=Math.round(((shapes[index].height))/descaleNumbers);
        rectangleB=Math.round(((shapes[index].width))/descaleNumbers);

        area=rectangleA*rectangleB;
        premier=2*rectangleA+2*rectangleB;

        //console.log("terület: ", area , "kerület:", premier);
    }
    else if (shapes[index].type === "pentagon")
    {
        R=Math.round((shapes[index].size)/descaleNumbers);
        PentagonA= Math.round(((2*R*Math.sin(PI/5)))/descaleNumbers);

        premier=PentagonA*5;
        area=5 * Math.pow(R, 2) * Math.pow(Math.sin(PI / 5), 2) * (1 / Math.tan(Math.PI / 5));

        //console.log("kerület: ",premier, "terület:", area);
    }
    else if (shapes[index].type === "hexagon")
        {
            hexagonA=Math.round((shapes[index].size)/descaleNumbers);
            premier=hexagonA*6;

            area=((3*Math.sqrt(3))/2)*Math.pow(hexagonA, 2);// a többi négyzetes értéket is kicserélni

            //console.log("kerület: ",premier,"terület:", area); T=((3*√3)/2)*a^2
    }
    else if (shapes[index].type === "octagon")
    {
                
        octagonRadius=Math.round((shapes[index].size)/descaleNumbers);
        // a oldal
        const calculateDegree = Math.sin((180 / 8) * (Math.PI / 180));
        octagonA=(Math.round(2*octagonRadius*calculateDegree))/descaleNumbers;

        // Kerület: K = 16 * R * sin(π/8)
        premier= 16 * octagonRadius * Math.sin(PI / 8);
                
        // Terület: T =2*( R^2 * sqrt(2)) 
        area=2*(Math.pow(octagonRadius, 2) * Math.sqrt(2));// a többi négyzetes értéket is kicserélni
    
        //console.log("kerület: ",premier,"terület:", area);
    }
    area=Math.round(area);
    premier=Math.round(premier);
}


//felugro ablak dolgok kiírásához:
function showModal(message) {
    const modal = document.getElementById("customModal");
    const modalText = document.getElementById("modalText");
    const closeBtn = document.querySelector(".close");

    modalText.textContent = message;
    modal.style.display = "block";

    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
    
}

//feladat
// Feladatok tömbje szöveggel és értékkel
const tasks = [
    /*{ message: "Rajzolj egy vonalat!", value: 0, diff:"easy" },
    */{ message: "Rajzolj egy kört!", value: 0, diff:"easy" },
    { message: "Rajzolj egy négyzetet, és számold ki a területét!", value: 0, diff:"medium" },/*
    { message: "Rajzolj egy szabályos ötszöget, hatszöget vagy nyolcszöget, és számold ki a kerületét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy téglalapot, és számold ki a kerületét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy háromszöget, és számold ki a kerületét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy szabályos kört, és számold ki a kerületét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy ötszöget, és számold ki a területét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy háromszöget, és számold ki a területét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy kört, és számold ki a területét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy négyzetet, és számold ki a területét!", value: 0, diff:"medium" },
    { message: "Rajzolj egy ellipszist!", value: 0 , diff:"easy"},
    { message: "Rajzolj egy háromszöget!", value: 0, diff:"easy" },
    { message: "Rajzolj egy derékszögű háromszöget!", value: 0, diff:"easy" },
    { message: "Rajzolj egy négyzetet!", value: 0, diff:"easy" },
    { message: "Rajzolj egy téglalapot!", value: 0, diff:"easy" },
    { message: "Rajzolj egy ötszöget!", value: 0, diff:"easy" },
    { message: "Rajzolj egy hatszöget!", value: 0, diff:"easy" },
    { message: "Rajzolj egy nyolcszöget!", value: 0, diff:"easy" }*/
];
let currentTask="";
let currentTaskDifficulty="";
const easyTasks = tasks.filter(task => task.diff === "easy");
const mediumTasks = tasks.filter(task => task.diff === "medium");

function updateTaskValue(taskMessage, newValue) {
    const task = tasks.find(t => t.message === taskMessage);
    if (task) {
        task.value = newValue;
    }
}

function showNewTask(difficulty){
// Véletlenszerű üzenet kiválasztása és megjelenítése

console.log(difficulty);

console.log(mediumTasks);
if (difficulty==="easy"){
    if (easyTasks.length > 0) { 
        // Véletlenszerűen választunk egy elemet
        const randomIndex = Math.floor(Math.random() * easyTasks.length);
        const randomTask = easyTasks[randomIndex];
    
        const message = randomTask.message;
        showModal(message); // Feltételezem, hogy van egy ilyen függvényed
        currentTask = message; // Feltételezem, hogy ezt máshol használod
        currentTaskDifficulty = "easy";
        console.log(message);
    }
}
else if(difficulty==="medium"){
    if (mediumTasks.length > 0) { 
    // Véletlenszerűen választunk egy elemet
    const randomIndex = Math.floor(Math.random() * mediumTasks.length);
    const randomTask = mediumTasks[randomIndex];

    const message = randomTask.message;
    showModal(message); // Feltételezem, hogy van egy ilyen függvényed
    currentTask = message; // Feltételezem, hogy ezt máshol használod
    currentTaskDifficulty="medium";
    console.log(message);
    }
} else {
    console.log("Nincs feladat!");
}


}

function toggleDropdown() {
    const dropdown = document.getElementById("dropdownContent");
    dropdown.classList.toggle("show");
}
// legürdülő menü
window.onclick = function(event) {
    if (!event.target.matches('button')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function checkTask(){
    //console.log(currentTask);
    if(currentTaskDifficulty==="easy"){
        if (currentTask==="Rajzolj egy vonalat!" && shapes[selectedShapeIndex].type==="line"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy vonalat!",1);
        }
        else if(currentTask==="Rajzolj egy kört!" && shapes[selectedShapeIndex].type==="circle"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy kört!",1);
        }
        else if(currentTask==="Rajzolj egy ellipszist!" && (shapes[selectedShapeIndex].type==="ellipse" || currentTask==="Rajzolj egy kört!")){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy ellipszist!",1);
        }
        else if(currentTask==="Rajzolj egy háromszöget!" && (shapes[selectedShapeIndex].type==="triangle" || shapes[selectedShapeIndex].type==="right_triangle")){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy háromszöget!",1);
        }
        else if(currentTask==="Rajzolj egy derékszögű háromszöget!" && shapes[selectedShapeIndex].type==="right_triangle"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy derékszögű háromszöget!",1);
        }
        else if(currentTask==="Rajzolj egy négyzetet!" && shapes[selectedShapeIndex].type==="square"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy négyzetet!",1);
        }
        else if(currentTask==="Rajzolj egy téglalapot!" && (shapes[selectedShapeIndex].type==="square" || shapes[selectedShapeIndex].type==="rectangle")){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy téglalapot!",1);
        }
        else if(currentTask==="Rajzolj egy ötszöget!" && shapes[selectedShapeIndex].type==="pentagon"){
            console.log("jooo");
            updateTaskValue("Rajzolj egy ötszöget!",1);
        }
        else if(currentTask==="Rajzolj egy hatszöget!" && shapes[selectedShapeIndex].type==="hexagon"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy hatszöget!",1);
        }
        else if(currentTask==="Rajzolj egy nyolcszöget!" && shapes[selectedShapeIndex].type==="octagon"){
            const results = `a feladat sikeresen végrehajtva`;
            showModal(results);
            updateTaskValue("Rajzolj egy nyolcszöget!",1);
        } else{
            const results = `a feladat nem sikerült vagy nem a jó alakzat van kijelölve, a feladat:`+ currentTask;
            showModal(results);
        }
    }else if(currentTaskDifficulty==="medium"){
        if(currentTask==="Rajzolj egy négyzetet, és számold ki a területét!" && shapes[selectedShapeIndex].type==="square")
        {
            calculateShapesData(selectedShapeIndex);
             // ezt kell majd megadni és egy modal-ból elkérni a felhasználótól majd összeegyeztetni a sima terület képettel majd megválaszolni hogy helyes-e 


            const userAreaInput = prompt("Add meg a terület értékét:");
            if (userAreaInput !== null) {
                const userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === area) {
                    showModal("A megadott szám megegyezik a területtel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy négyzetet, és számold ki a területét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a területtel, az értékeket kerekítse egészre!");
                }
            }
            console.log("user input: ", area, userAreaInput);

        } else if(currentTask==="Rajzolj egy kört, és számold ki a területét!" && (shapes[selectedShapeIndex].type==="circle" || shapes[selectedShapeIndex].type==="ellipse")){
            console.log("medium mukodik. kör");
            console.log(shapes.length-1);
            calculateShapesData(selectedShapeIndex);
            console.log(area);

            const userAreaInput = prompt("Add meg a terület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === area) {
                    showModal("A megadott szám megegyezik a területtel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy négyzetet, és számold ki a területét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a területtel , az értékeket kerekítse egészre!");
                }
                //console.log(area,"asda", userValue);
            }

        } else if(currentTask==="Rajzolj egy háromszöget, és számold ki a területét!" && (shapes[selectedShapeIndex].type==="triangle" || shapes[selectedShapeIndex].type==="right_triangle")){
            console.log("medium mukodik. kör");
            console.log(selectedShapeIndex);
            calculateShapesData(selectedShapeIndex);
            console.log(area);

            const userAreaInput = prompt("Add meg a terület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === area) {
                    showModal("A megadott szám megegyezik a területtel!, feladat teljesült! ");
                    updateTaskValue("Rajzolj egy négyzetet, és számold ki a területét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a területtel, az értékeket kerekítse egészre!");
                }
                //console.log(area,"asda", userValue);
            }

        } else if(currentTask==="Rajzolj egy ötszöget, és számold ki a területét!" && shapes[selectedShapeIndex].type==="pentagon"){
            /*console.log("medium mukodik. kör");
            console.log(shapes.length-1);
            console.log(area);*/
            calculateShapesData(selectedShapeIndex);

            const userAreaInput = prompt("Add meg a terület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === area) {
                    showModal("A megadott szám megegyezik a területtel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy négyzetet, és számold ki a területét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a területtel!, az értékeket kerekítse egészre");
                }
                //console.log(area,"asda", userValue);
            }

        } else if (currentTask === "Rajzolj egy szabályos kört, és számold ki a kerületét!" && shapes[selectedShapeIndex].type==="circle"){
            calculateShapesData(selectedShapeIndex);

            const userAreaInput = prompt("Add meg a kerület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === premier) {
                    showModal("A megadott szám megegyezik a kerülettel!");
                    updateTaskValue("Rajzolj egy szabályos kört, és számold ki a kerületét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a kerülettel, az értékeket kerekítse egészre!");
                }
                //console.log(area,"asda", userValue);
            }
        } else if (currentTask === "Rajzolj egy háromszöget, és számold ki a kerületét!" && (shapes[selectedShapeIndex].type==="triangle" || shapes[selectedShapeIndex].type==="right_triangle")){
            calculateShapesData(selectedShapeIndex);

            const userAreaInput = prompt("Add meg a kerület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === premier) {
                    showModal("A megadott szám megegyezik a kerülettel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy háromszöget, és számold ki a kerületét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a kerülettel, az értékeket kerekítse egészre!");
                }
                //console.log(area,"asda", userValue);
            }
        }
        else if (currentTask === "Rajzolj egy téglalapot, és számold ki a kerületét!" && (shapes[selectedShapeIndex].type==="square" || shapes[selectedShapeIndex].type==="rectangle")){
            calculateShapesData(selectedShapeIndex);

            const userAreaInput = prompt("Add meg a kerület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === premier) {
                    showModal("A megadott szám megegyezik a kerülettel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy téglalapot, és számold ki a kerületét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a kerülettel, az értékeket kerekítse egészre!"); 
                }
                
            }
        }else if (currentTask === "Rajzolj egy szabályos ötszöget, hatszöget vagy nyolcszöget, és számold ki a kerületét!" && (shapes[selectedShapeIndex].type==="pentagon" || shapes[selectedShapeIndex].type==="hexagon" || shapes[selectedShapeIndex].type==="octagon")){
            calculateShapesData(selectedShapeIndex);

            const userAreaInput = prompt("Add meg a kerület értékét:");
            if (userAreaInput !== null) {
                let userValue = parseInt(userAreaInput, 10);
                if (isNaN(userValue)) {
                    showModal("Érvénytelen számot adtál meg!");
                } else if (userValue === premier) {
                    showModal("A megadott szám megegyezik a kerülettel!, feladat teljesült!");
                    updateTaskValue("Rajzolj egy szabályos ötszöget, hatszöget vagy nyolcszöget, és számold ki a kerületét!",1);
                } else {
                    showModal("A megadott szám NEM egyezik meg a kerülettel , az értékeket kerekítse egészre!"); 
                }
                
            }
        }
    } 
    else{
        let errorTaskMassage= "feladat nem sikerült, vagy nem jó alakzat lett kijelölve " + currentTask;
        showModal(errorTaskMassage);
    }
}




// Az egérkattintás eseménykezelője
function handleMouseDown(e) {
    isDrawing = true;
    startX = (e.offsetX / zoomLevel) - canvasX;
    startY = (e.offsetY / zoomLevel) - canvasY;
    endX = e.offsetX- canvasX;
    endY = e.offsetY- canvasY;
    currentPath = [];
    currentPath.push({ x: (e.offsetX / zoomLevel) - canvasX, y: (e.offsetY / zoomLevel) - canvasY });


    if (drawingMode === "customTriangle") {
        customTrianglePoints.push({ x: (e.offsetX / zoomLevel) - canvasX, y: (e.offsetY / zoomLevel) - canvasY });
        if (customTrianglePoints.length === 3) {
            shapes.push({id: shapes.length, type: "triangle", points: customTrianglePoints ,colorshape,lineStyle, fillColor});//bármely 3szög feltöltése a shapes tömbbe
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
// a legközelebbi pont megállapítása az egérhez
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
            if (shape.type === "freehand") {
                
                //minden pont frissítése 
                const boundingBox = getBoundingBox(shape.path);
                const deltaX = mouseX - offsetX - boundingBox.x;
                const deltaY = mouseY - offsetY - boundingBox.y;
                shape.path.forEach(point => {
                    point.x += deltaX;
                    point.y += deltaY;
                });
                

            }else {
            // további alakzatokhoz
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
            shape.x = mouseX - offsetX;
            shape.y = mouseY - offsetY;
        }
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
function handleMouseUp() {
    isDrawing = false;


// forgatási érték
    const rotation = 0;


// sugár kiszámítása
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

// Rajzolás az alakzat hozzáadásával a listához
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
    /*const shapesJSON = JSON.stringify(shapes, null, 2);
    const shapesContentDiv = document.getElementById("shapesContent");
    shapesContentDiv.innerText = shapesJSON;*/
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
        const tolerance = 5;
        const distanceToStart = Math.sqrt((pointX - startX) ** 2 + (pointY - startY) ** 2);
        const distanceToEnd = Math.sqrt((pointX - endX) ** 2 + (pointY - endY) ** 2);
        const lineLength = Math.sqrt((startX - endX) ** 2 + (startY - endY) ** 2);

// távolság kiszámítása
        const distanceToLine = Math.abs(
            (endX - startX) * (startY - pointY) - (startX - pointX) * (endY - startY)
        ) / lineLength;

// vonal egyedi mozgatása
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


// canvas törlése
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
document.getElementById('szinPaletta').addEventListener('change', (event) => {
    colorshape = event.target.value;
});

//vonaltípus
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
    //console.log("redraw canvas lefut");
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

// középpont kiszámítása
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
            centerX = shape.x + shape.width / 2;
            centerY = shape.y + shape.height / 2;
        } else if (
            shape.type === "pentagon" ||
            shape.type === "hexagon" ||
            shape.type === "octagon"
        ) {
// ahol már megvan a középpont
            centerX = shape.centerX;
            centerY = shape.centerY;
        }

// forgatás és mozgatás
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

// tömb frissítése
        shapes[i].rotation = shape.rotation;



//}

        ctx.strokeStyle = isSelected ? "red" : "black";
        ctx.lineWidth = isSelected ? 3 : 1;



// shape rajzolása
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

// segítő funkció
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

// segítés a háromszög közepéhez
function getCentroid(points) {
    const centerX = (points[0].x + points[1].x + points[2].x) / 3;
    const centerY = (points[0].y + points[1].y + points[2].y) / 3;
    return { x: centerX, y: centerY };
}
// segítség a szabályos háromszöghöz
function getCentroidRightTriangle(shape) {
    const centerX = (shape.x1 + shape.x2 + shape.x3) / 3;
    const centerY = (shape.y1 + shape.y2 + shape.y3) / 3;
    return { x: centerX, y: centerY };
}



initEventListeners();
function handleRotate() {
    if (selectedShapeIndex !== -1) {
// a kijelölt alakzat
        const shape = shapes[selectedShapeIndex];

// forgatás
        const angle = parseInt(rotateAngleInput.value);
        shape.rotation = angle;

        redrawCanvas();
    }
}
// kijelölt alakzat törlése
function deleteSelectedShape() {
    if (selectedShapeIndex !== -1) {
        // alakzat eltávolítása a tömbből
        shapes.splice(selectedShapeIndex, 1);
        selectedShapeIndex = -1;

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
    // text törlése
    texts.splice(selectedShapeIndex, 1);
    selectedShapeIndex = -1;

    // újrarajzolás
    redrawCanvas();
    displayShapesContent();
    displayCanvasContent();
}

//redrawCanvas();

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


