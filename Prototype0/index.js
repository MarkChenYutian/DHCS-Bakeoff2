// =========== This part is required: =========== 
// This constant can be changed while you are experimenting, but it should be set back to 10 for the Bakeoff:
const tasksLength = 10;

// As with Bakeoff 1, this code uses the svg.js library; documentation at: https://svgjs.dev/docs/3.0/
// Create an svg div that is the specified size, in the div with ID "main". (Centering it on the page is handled by CSS.)
// The "size" attribute here is specified as a string.
let svg = SVG().addTo('#main').size(""+canvasSize+"px", ""+canvasSize+"px");
let controller_handle = document.getElementById("control-state");

// Initialize the "judge" object with the number of tasks per trial, your svg drawing area, and a team name.
const judge = new Judge(tasksLength, svg, "teamName");
// =========== /end required =========== 

// The original footer button are too ugly, hacked to fix that.
const control_panel = document.getElementById("control-panel");

// ---- Create Reset Button ----
const reset_btn = document.createElement("button");
reset_btn.innerText = 'Reset';
reset_btn.style = 'background-color: #f44336; color: white; border: none; cursor: pointer; padding: 1rem;';

// ---- Create Next Task Button ----
const next_btn = document.createElement("button");
next_btn.innerText = 'Next Task';
next_btn.style = 'background-color: #4CAF50; color: white; border: none; cursor: pointer; padding: 1rem;';

// ---- Button container ----
const button_container = document.createElement("div");
button_container.style = 'display: flex; justify-content: space-around; width: 100%; margin-top: 1rem;';
button_container.appendChild(next_btn);
button_container.appendChild(reset_btn);
control_panel.appendChild(button_container);

//

// =================== SLIDERS SETUP ===================

// ---- Rotation Slider ----
let rotateLabel = document.createElement("label");
rotateLabel.innerText = "Rotation:";
rotateLabel.style.marginTop = "1rem";
rotateLabel.style.display = "block";

let rotateSlider = document.createElement("input");
rotateSlider.type = "range";
rotateSlider.min = "0";
rotateSlider.max = "360";
rotateSlider.value = "0";
rotateSlider.style.width = "100%";

// ---- Scale Slider ----
let scaleLabel = document.createElement("label");
scaleLabel.innerText = "Scale:";
scaleLabel.style.marginTop = "1rem";
scaleLabel.style.display = "block";

let scaleSlider = document.createElement("input");
scaleSlider.type = "range";
scaleSlider.min = "10";  // 10%
scaleSlider.max = "400"; // 400%
scaleSlider.value = "100";
scaleSlider.style.width = "100%";

let dragging = false;
let lastX = 0;
let lastY = 0;

// ---- Append sliders to control panel ----
control_panel.appendChild(rotateLabel);
control_panel.appendChild(rotateSlider);
control_panel.appendChild(scaleLabel);
control_panel.appendChild(scaleSlider);



// Events you can assign handlers to:
// 		score: when a task is scored
// 		newTask: when a new task (the set of start and goal positions) is created
// 		testOver: when all tasks have been fulfilled
// 		setup: when the judge is first created, and whenever the "reset" button is pressed
// 		clearField: when the judge removes the squares from the previous round
// judge.on(eventName, callback) will allow you to register a callback (handler) to any of the above.

// Other functions you can call:
// judge.getCurrentTask() will return a "task" object shaped like this:
//		{
//			start: {
//				position: {
//						x: number,
//						y: number
//					},
//				rotation: number,
//				size: number,
//				square: SVG.Rect
//			},
//			goal: {
//				position: {
//					x: number,
//					y: number
//				},
//				rotation: number,
//				size: number,
//				square: SVG.Rect
//			}
//		};
// 
// judge.getTaskNumber() will return the number (integer) of the current task
// judge.setup() starts everything in motion.


//  =========== !!! FOR EXAMPLE !!! =========== 

// Here are some consts just for this example code:
const startColor = "#6677ee";
const active_borderColor = "#F00";
const inactive_borderColor = "#777";
const goalColor = "#777";

// And a global variable for dragging
let squareBeingClicked = false;

// These "SVG groups" will hold the squares. I could put other things in these groups, and then everything would move together.
let manipulator = svg.group();
let goal = svg.group();


let dragging = false;
let lastX = 0;
let lastY = 0;

// On mouse down, start dragging
svg.on("mousedown", (e) => {
    if (squareBeingClicked) { // only drag if square is active
        dragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
});

// Stop dragging when mouse up
svg.on("mouseup", () => {
    dragging = false;
});

// Handle mouse movement while dragging
svg.on("mousemove", (e) => {
    if (dragging) {
        let dx = e.offsetX - lastX;
        let dy = e.offsetY - lastY;
        manipulator.dmove(dx, dy); // move relative to last position
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
});

// When a new task is assigned, run this...
judge.on("newTask", () => {
    // get the next task
    let task = judge.getCurrentTask();

    // style the start and goal squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // add the new squares to the groups
    manipulator.add(task.start.square);
    goal.add(task.goal.square);

    // Reset manipulator transform and sliders when new task starts
    manipulator.transform({rotation: 0, scale: 1});
    rotateSlider.value = "0";
    scaleSlider.value = "100";

    // ---- Rotation Slider Handler ----
    rotateSlider.oninput = function() {
        // Get current translation to keep square in same position
        let currentTransform = manipulator.transform();
        manipulator.transform({
            rotation: this.value,
            scale: scaleSlider.value / 100,
            translateX: currentTransform.translateX,
            translateY: currentTransform.translateY
        });
    }
    
    // ---- Scale Slider Handler ----
    scaleSlider.oninput = function() {
        // Get current translation to keep square in same position
        let currentTransform = manipulator.transform();
        manipulator.transform({
            scale: this.value / 100,
            rotation: rotateSlider.value,
            translateX: currentTransform.translateX,
            translateY: currentTransform.translateY
        });
    }

    
    // add some event handlers to the square
    // https://svgjs.dev/docs/3.0/events/#event-listeners
    let squareClickHandler = function() {
        squareBeingClicked = squareBeingClicked ? false : true;
        if (squareBeingClicked) {
            task.start.square.stroke({color: active_borderColor, width: 2});
            controller_handle.innerHTML = "Active";
        } else {
            task.start.square.stroke({color: inactive_borderColor, width: 2});
            controller_handle.innerHTML = "Inactive";
        }
    }
    task.start.square.on("click", squareClickHandler);
});

// once you've got your handlers set up, start it up:
judge.setup();
