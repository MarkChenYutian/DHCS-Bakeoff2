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
const footer = document.querySelector("footer")
footer.parentNode.removeChild(footer);
const control_panel = document.getElementById("control-panel");
control_panel.appendChild(footer);

const reset_btn = footer.children[0];
const next_btn = footer.children[1];
console.log(next_btn.innerHTML)
next_btn.innerHTML = 'Next Task';
reset_btn.innerHTML = 'Reset';
next_btn.parentNode.removeChild(next_btn);
reset_btn.parentNode.removeChild(reset_btn);
button_container = document.createElement("div");
button_container.appendChild(next_btn);
button_container.appendChild(reset_btn);
button_container.style = 'display: flex; justify-content: space-around; width: 100%;';
next_btn.style = 'background-color: #4CAF50; color: white; border: none; cursor: pointer;';
reset_btn.style = 'background-color: #f44336; color: white; border: none; cursor: pointer;';
control_panel.appendChild(button_container);
//


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

// Any time the mouse moves over the svg area...
svg.on("mousemove", (e)=>{
    if (squareBeingClicked) {
        manipulator.center(e.offsetX, e.offsetY);
    }
})

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
