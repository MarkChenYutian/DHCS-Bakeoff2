// =========== Required Constants ===========
const tasksLength = 10;
const canvasSize = 400; // Define canvas size

// Initialize SVG canvas
let svg = SVG().addTo('#main').size(`${canvasSize}px`, `${canvasSize}px`);
let controller_handle = document.getElementById("control-state");

// Initialize judge
const judge = new Judge(tasksLength, svg, "teamName");

// Footer buttons
const reset_btn = document.getElementById("reset-btn");
const next_btn = document.getElementById("next-btn");

// Button styles (optional, but consistent with your original code)
reset_btn.style = 'background-color: #f44336; color: white; border: none; cursor: pointer;';
next_btn.style = 'background-color: #4CAF50; color: white; border: none; cursor: pointer;';

// Colors and interaction variables
const startColor = "#6677ee";
const active_borderColor = "#F00";
const inactive_borderColor = "#777";
const goalColor = "#777";
let squareBeingClicked = false;

// Groups to hold the squares
let manipulator = svg.group();
let goal = svg.group();

// Dragging functionality
svg.on("mousemove", (e) => {
    if (squareBeingClicked) {
        manipulator.center(e.offsetX, e.offsetY);
    }
});

// Handle new task creation
judge.on("newTask", () => {
    let task = judge.getCurrentTask();

    // Style squares
    task.start.square.fill(startColor).stroke({ color: inactive_borderColor, width: 2 });
    task.goal.square.fill('none').stroke(goalColor);

    // Add to groups
    manipulator.add(task.start.square);
    goal.add(task.goal.square);

    // Click handler
    task.start.square.on("click", () => {
        squareBeingClicked = !squareBeingClicked;
        if (squareBeingClicked) {
            task.start.square.stroke({ color: active_borderColor, width: 2 });
            controller_handle.innerHTML = "Active";
        } else {
            task.start.square.stroke({ color: inactive_borderColor, width: 2 });
            controller_handle.innerHTML = "Inactive";
        }
    });
});

// Button event listeners
reset_btn.addEventListener('click', () => judge.setup());
next_btn.addEventListener('click', () => judge.nextTask());

// Start
judge.setup();
