// Required setup
const tasksLength = 10;
let svg = SVG().addTo('#main').size("" + canvasSize + "px", "" + canvasSize + "px");
let controller_handle = document.getElementById("control-state");
const judge = new Judge(tasksLength, svg, "teamName");

// Footer buttons styling
const footer = document.querySelector("footer");
footer.parentNode.removeChild(footer);
const control_panel = document.getElementById("control-panel");
control_panel.appendChild(footer);

const reset_btn = footer.children[0];
const next_btn = footer.children[1];
next_btn.innerHTML = 'Next Task';
reset_btn.innerHTML = 'Reset';
next_btn.parentNode.removeChild(next_btn);
reset_btn.parentNode.removeChild(reset_btn);

let button_container = document.createElement("div");
button_container.appendChild(next_btn);
button_container.appendChild(reset_btn);
button_container.style = 'display: flex; justify-content: space-around; width: 100%;';
next_btn.style = 'background-color: #4CAF50; color: white; border: none; cursor: pointer;';
reset_btn.style = 'background-color: #f44336; color: white; border: none; cursor: pointer;';
control_panel.appendChild(button_container);

// Sliders setup
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

let scaleLabel = document.createElement("label");
scaleLabel.innerText = "Scale:";
scaleLabel.style.marginTop = "1rem";
scaleLabel.style.display = "block";

let scaleSlider = document.createElement("input");
scaleSlider.type = "range";
scaleSlider.min = "5";
scaleSlider.max = "300";
scaleSlider.value = "100";
scaleSlider.style.width = "100%";

control_panel.appendChild(rotateLabel);
control_panel.appendChild(rotateSlider);
control_panel.appendChild(scaleLabel);
control_panel.appendChild(scaleSlider);

// Constants
const startColor = "#6677ee";
const active_borderColor = "#F00";
const inactive_borderColor = "#777";
const goalColor = "#777";

// Global variables for interaction
let currentRotation = 0;
let currentScale = 1;
let isDragging = false;

// SVG groups for start and goal squares
let manipulator = svg.group();
let goal = svg.group();

// Function to apply combined transforms
function applyTransform() {
    manipulator.transform({
        rotation: currentRotation,
        scale: currentScale,
        translateX: manipulator.cx(),
        translateY: manipulator.cy()
    });
}

// Dragging behavior
svg.on("mousemove", (e) => {
    if (isDragging) {
        manipulator.center(e.offsetX, e.offsetY);
        applyTransform();
    }
});

// When a new task starts
judge.on("newTask", () => {
    let task = judge.getCurrentTask();

    // Style start and goal squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // Add to groups
    manipulator.add(task.start.square);
    goal.add(task.goal.square);

    // Reset transform state
    currentRotation = 0;
    currentScale = 1;
    isDragging = false;

    manipulator.center(task.start.position.x, task.start.position.y);
    applyTransform();

    // Calculate sizes
    let startSize = task.start.size;
    let goalSize = task.goal.size;

    // Dynamically adjust slider range based on goal and start size
    let minScalePercent = Math.max(1, (goalSize / startSize) * 50);
    let maxScalePercent = Math.max(300, (goalSize / startSize) * 200);
    
    scaleSlider.min = minScalePercent.toFixed(0);
    scaleSlider.max = maxScalePercent.toFixed(0);
    
    // Start at current scale = 100%
    scaleSlider.step = "1";
    scaleSlider.value = "100";
    currentScale = 1;
    
    scaleLabel.innerText = `Scale (%): ${minScalePercent}% - ${maxScalePercent}%`;


    // Reset sliders
    rotateSlider.value = "0";
    scaleSlider.value = "100";

    // Slider handlers
    rotateSlider.oninput = function () {
        currentRotation = parseInt(this.value);
        applyTransform();
    };

    scaleSlider.oninput = function () {
        currentScale = parseInt(this.value) / 100;
        applyTransform();
    };

    // Click to toggle dragging
    task.start.square.on("click", () => {
        isDragging = !isDragging;
        if (isDragging) {
            task.start.square.stroke({ color: active_borderColor, width: 2 });
            controller_handle.innerHTML = "Active";
        } else {
            task.start.square.stroke({ color: inactive_borderColor, width: 2 });
            controller_handle.innerHTML = "Inactive";
        }
    });
});

// Start the judge
judge.setup();
