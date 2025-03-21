// =========== This part is required: =========== 
// This constant can be changed while you are experimenting, but it should be set back to 10 for the Bakeoff:
const tasksLength = 10;

// As with Bakeoff 1, this code uses the svg.js library; documentation at: https://svgjs.dev/docs/3.0/
// Create an svg div that is the specified size, in the div with ID "main". (Centering it on the page is handled by CSS.)
// The "size" attribute here is specified as a string.
let svg = SVG().addTo('#main').size(""+canvasSize+"px", ""+canvasSize+"px");

// Initialize the "judge" object with the number of tasks per trial, your svg drawing area, and a team name.
const judge = new Judge(tasksLength, svg, "teamName");
// =========== /end required =========== 

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
const goalColor = "#777";

// And a global variable for dragging
let squareBeingClicked = false;


//// Global variables for dragging
let currentTask; // Holds the current task object (start & goal info)
let currentSquare; // Holds the current square SVG element

// These "SVG groups" will hold the squares. I could put other things in these groups, and then everything would move together.
let manipulator = svg.group();
let goal = svg.group();

// Get references to size and rotation sliders
const sizeSlider = document.getElementById('sizeSlider');
const rotateSlider = document.getElementById('rotateSlider');

// Any time the mouse moves over the svg area...
svg.on("mousemove", (e)=>{
    if (squareBeingClicked) {
        manipulator.center(e.offsetX, e.offsetY);
    }
})

// Handle size slider input
sizeSlider.addEventListener('input', () => {
    if (currentSquare) {
        let newSize = parseFloat(sizeSlider.value);
        // Visually resize the square
        currentSquare.size(newSize, newSize);
        // Update task's size data
        currentTask.start.size = newSize;
    }
});

// Handle rotation slider input: rotate the square when slider changes
rotateSlider.addEventListener('input', () => {
    if (currentSquare) {
        let newRotation = parseFloat(rotateSlider.value);
        // Rotate the group
        manipulator.rotate(newRotation);
        // Update task data
        currentTask.start.rotation = newRotation;
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

     // ======== NEW: Set sliders to current start values ========
    sizeSlider.value = task.start.size;
    rotateSlider.value = task.start.rotation;

    // event handlers for dragging
    let squareClickHandler = function() {
        console.log("Click!");
    }
    task.start.square.on("click", squareClickHandler);

    task.start.square.on("mousedown", (e) => {
        squareBeingClicked = true;
    });

    task.start.square.on("mouseup", (e) => {
        squareBeingClicked = false;
    });
//comment
    // add some event handlers to the square
    // https://svgjs.dev/docs/3.0/events/#event-listeners
    let squareClickHandler = function() {
        console.log("Click!");
    }
    task.start.square.on("click", squareClickHandler);

    task.start.square.on("mousedown", (e)=> {
        squareBeingClicked = true;
    });

    task.start.square.on("mouseup", (e)=> {
        squareBeingClicked = false;
    });
});

// once you've got your handlers set up, start it up:
judge.setup();
