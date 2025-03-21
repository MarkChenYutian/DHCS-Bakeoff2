// =========== This part is required ===========
const tasksLength = 10;
let svg = SVG().addTo('#main').size(""+canvasSize+"px", ""+canvasSize+"px");
const judge = new Judge(tasksLength, svg, "teamName");

// Constants
const startColor = "#6677ee";
const goalColor = "#777";
let squareBeingClicked = false;
let manipulator = svg.group();
let goal = svg.group();

// Get slider elements
const sizeSlider = document.getElementById('scale');
const rotateSlider = document.getElementById('rotation');

// ========== Mouse Movement ==========
svg.on("mousemove", (e)=>{
    if (squareBeingClicked) {
        manipulator.center(e.offsetX, e.offsetY);
    }
});

// ========== Slider Controls ==========
// Add these ONCE!
rotateSlider.addEventListener('input', () => {
    let angle = parseFloat(rotateSlider.value);
    manipulator.rotate(angle);
});

sizeSlider.addEventListener('input', () => {
    let scaleFactor = parseFloat(sizeSlider.value) / 100;
    manipulator.scale(scaleFactor);
});

// ========== New Task ==========
judge.on("newTask", () => {
    let task = judge.getCurrentTask();

    // Style squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // Add to groups
    manipulator.add(task.start.square);
    goal.add(task.goal.square);

    // Set sliders to start values
    sizeSlider.value = task.start.size;
    rotateSlider.value = task.start.rotation;

    // Dragging handlers
    task.start.square.on("mousedown", (e) => {
        squareBeingClicked = true;
    });
    task.start.square.on("mouseup", (e) => {
        squareBeingClicked = false;
    });
    task.start.square.on("click", () => {
        console.log("Square clicked");
    });
});

// Start
judge.setup();
