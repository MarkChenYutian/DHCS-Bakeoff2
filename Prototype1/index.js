// =========== This part is required: =========== 
// This constant can be changed while you are experimenting, but it should be set back to 10 for the Bakeoff:
const tasksLength = 10;

// As with Bakeoff 1, this code uses the svg.js library; documentation at: https://svgjs.dev/docs/3.0/
// Create an svg div that is the specified size, in the div with ID "main". (Centering it on the page is handled by CSS.)
// The "size" attribute here is specified as a string.
let svg = SVG().addTo('#main').size(""+canvasSize+"px", ""+canvasSize+"px");
const controller_handle = document.getElementById("control-state");
const main_container = document.getElementById("main");

// Initialize the "judge" object with the number of tasks per trial, your svg drawing area, and a team name.
const judge = new Judge(tasksLength, svg, "teamName");
// =========== /end required =========== 

// The original footer button are too ugly, hacked to fix that.
const footer = document.querySelector("footer")
footer.parentNode.removeChild(footer);
const control_panel = document.getElementById("control-panel");
control_panel.appendChild(footer);
const remain_task_progress = document.getElementById("remain-task-cnt-prog");
const remain_task_text     = document.getElementById("remain-task-cnt-text");

const reset_btn = footer.children[0];
const next_btn = footer.children[1];

next_btn.innerHTML = 'Next Task';
reset_btn.innerHTML = 'Reset';

next_btn.parentNode.removeChild(next_btn);
reset_btn.parentNode.removeChild(reset_btn);

const button_container = document.createElement("div");
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


// Setup the manipulator group
function getSquareCorners(rect) {
    // Get position and size
    const x = rect.x()
    const y = rect.y()
    const width = rect.width()
    const height = rect.height()

    // Define the original corners (top-left, top-right, bottom-right, bottom-left)
    const corners = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height }
    ]

    // Get the global transformation matrix of the rectangle
    const matrix = rect.matrixify()

    // Apply the matrix to each corner
    const transformedCorners = corners.map(pt => {
        return {
            x: matrix.a * pt.x + matrix.c * pt.y + matrix.e,
            y: matrix.b * pt.x + matrix.d * pt.y + matrix.f
        }});
    return transformedCorners
}

function setupManipulator(manipulator, manipulate_square) {
    manipulator.add(manipulate_square);

    // Calculate the position to place the manipulators
    const square_corners = getSquareCorners(manipulate_square);
    const midpoints = [
        { x: (square_corners[0].x + square_corners[1].x) / 2, y: (square_corners[0].y + square_corners[1].y) / 2 },
        { x: (square_corners[1].x + square_corners[2].x) / 2, y: (square_corners[1].y + square_corners[2].y) / 2 },
        { x: (square_corners[2].x + square_corners[3].x) / 2, y: (square_corners[2].y + square_corners[3].y) / 2 },
        { x: (square_corners[3].x + square_corners[0].x) / 2, y: (square_corners[3].y + square_corners[0].y) / 2 }
    ];

    const center_x = midpoints.reduce((acc, pt) => acc + pt.x, 0) / 4;
    const center_y = midpoints.reduce((acc, pt) => acc + pt.y, 0) / 4;

    const scaled_midpoints = midpoints.map(pt => {
        const direction_vector = {x: (pt.x - center_x), y: (pt.y - center_y) };
        const norm = Math.sqrt(direction_vector.x ** 2 + direction_vector.y ** 2);

        return {
            x: pt.x + (10 / norm) * direction_vector.x,
            y: pt.y + (10 / norm) * direction_vector.y
        };
    });

    // Add the scaling manipulator UI to the manipulator group.
    const polygons = scaled_midpoints.map(corner => {
        const direction_vector = { x: corner.x - center_x, y: corner.y - center_y };
        const norm = Math.sqrt(direction_vector.x ** 2 + direction_vector.y ** 2);
        const unit_vector = { x: direction_vector.x / norm, y: direction_vector.y / norm };

        const base1 = {
            x: corner.x - 10 * unit_vector.y,
            y: corner.y + 10 * unit_vector.x
        };
        const base2 = {
            x: corner.x + 10 * unit_vector.y,
            y: corner.y - 10 * unit_vector.x
        };
        const tip = {
            x: corner.x + 10 * unit_vector.x,
            y: corner.y + 10 * unit_vector.y
        };

        return manipulator.polygon([
            [base1.x, base1.y],
            [base2.x, base2.y],
            [tip.x, tip.y]
        ]).fill(inactive_borderColor);
    });

    return [ manipulator, polygons ];
}

function updateControllerIndicator(interaction_type, move_controller, scale_controller) {
    controller_handle.innerHTML = interaction_type;
    if (interaction_type === 'move') {
        move_controller.fill(active_borderColor);
        scale_controller.forEach(ctrl => ctrl.fill(inactive_borderColor));
        main_container.style.cursor = "move";
    } else if (interaction_type === 'scale') {
        move_controller.fill(inactive_borderColor);
        scale_controller.forEach(ctrl => ctrl.fill(active_borderColor));
        main_container.style.cursor = "nesw-resize";
    } else {
        move_controller.fill(inactive_borderColor);
        scale_controller.forEach(ctrl => ctrl.fill(inactive_borderColor));
        main_container.style.cursor = "default";
    }
}


// Here are some consts just for this example code:
const startColor = "#777";
const active_borderColor = "#F00";
const inactive_borderColor = "#777";
const goalColor = "#6677ee";

// And a global variable for dragging
// interaction_type can be 'none', 'move', 'scale' and 'rotate'
let interaction_type = 'none';

// These "SVG groups" will hold the squares. I could put other things in these groups, and then everything would move together.
let scaling_controller;
let manipulator = svg.group();
let goal = svg.group();

// Any time the mouse moves over the svg area...
svg.on("mousemove", (e)=>{
    if (interaction_type === 'move') {
        manipulator.center(e.offsetX, e.offsetY);
    }
})

// reset callback from the judge is buggy, so we monkey patch it here.
reset_btn.onclick = () => {
    manipulator.clear();
    goal.clear();
    judge.setup();
};

// When a new task is assigned, run this...
judge.on("newTask", () => {
    // get the next task
    const task = judge.getCurrentTask();

    // update progress
    const task_number = judge.getTaskNumber();
    remain_task_progress.max = tasksLength;
    remain_task_progress.value = task_number;
    remain_task_progress.innerHTML = tasksLength - task_number;
    remain_task_text.innerHTML = `${task_number}/${tasksLength}`;

    // style the start and goal squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // add the new squares to the groups
    [ manipulator, scaling_controller ] = setupManipulator(manipulator, task.start.square);
    goal.add(task.goal.square);

    // Add event handler to handle the moving controller
    // https://svgjs.dev/docs/3.0/events/#event-listeners
    task.start.square.on("click", () => {
        interaction_type = (interaction_type === 'move') ? 'none' : 'move';
        updateControllerIndicator(interaction_type, task.start.square, scaling_controller);
    });

    // Add event handler to handle the scaling controller
    scaling_controller.forEach((controller, idx) => {
        controller.on("click", () => {
            interaction_type = (interaction_type === 'scale') ? 'none' : 'scale';
            updateControllerIndicator(interaction_type, task.start.square, scaling_controller);
        });
    });

});

// once you've got your handlers set up, start it up:
judge.setup();
