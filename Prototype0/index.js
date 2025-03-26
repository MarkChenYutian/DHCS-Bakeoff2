// =========== This part is required: =========== 
const tasksLength = 10; // Set to 10 for Bakeoff
let svg = SVG().addTo('#main').size("" + canvasSize + "px", "" + canvasSize + "px");

// Initialize Judge
const judge = new Judge(tasksLength, svg, "teamName");

// =========== UI Clean-up: =========== 
const footer = document.querySelector("footer");
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

const button_container = document.createElement("div");
button_container.appendChild(next_btn);
button_container.appendChild(reset_btn);
button_container.style = 'display: flex; justify-content: space-around; width: 100%;';

next_btn.style = 'background-color: #4CAF50; color: white; border: none; cursor: pointer;';
reset_btn.style = 'background-color: #f44336; color: white; border: none; cursor: pointer;';
control_panel.appendChild(button_container);

// =================== SLIDERS SETUP ===================

// ---- Rotation Slider ----
const rotateLabel = document.createElement("label");
rotateLabel.innerText = "Rotation:";
rotateLabel.style.marginTop = "1rem";
rotateLabel.style.display = "block";

const rotateSlider = document.createElement("input");
rotateSlider.type = "range";
rotateSlider.min = "0";
rotateSlider.max = "360";
rotateSlider.value = "0";
rotateSlider.style.width = "100%";

// ---- Scale Slider ----
const scaleLabel = document.createElement("label");
scaleLabel.innerText = "Scale:";
scaleLabel.style.marginTop = "1rem";
scaleLabel.style.display = "block";

const scaleSlider = document.createElement("input");
scaleSlider.type = "range";
scaleSlider.min = "50";  // 50%
scaleSlider.max = "200"; // 200%
scaleSlider.value = "100";
scaleSlider.style.width = "100%";

// ---- Append sliders ----
control_panel.appendChild(rotateLabel);
control_panel.appendChild(rotateSlider);
control_panel.appendChild(scaleLabel);
control_panel.appendChild(scaleSlider);

// =========== Main Setup ===========

// Colors
const startColor = "#6677ee";
const goalColor = "#777";

// Dragging flag
let isDragging = false;

// Tracks the current transformation state (rotation, scale, and translation)
// so all changes (slider or drag) preserve previous values instead of resetting them
let currentRotation = 0;
let currentScale = 1;
let currentTranslate = { x: 0, y: 0 };
let task; 


// SVG groups
let manipulator = svg.group();
let goal = svg.group();

// Calculate relative movement 
svg.on("mousemove", (e) => {
    if (isDragging && task) {
        // Calculate relative movement (optional enhancement)
        currentTranslate.x = e.offsetX;
        currentTranslate.y = e.offsetY;

        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });
    }
});

// Handle new task
judge.on("newTask", () => {
    task = judge.getCurrentTask();

    // Clear previous manipulator and goal squares
    manipulator.clear();
    goal.clear();

    // Style start and goal squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // Add squares to groups
    manipulator.add(task.start.square);
    goal.add(task.goal.square);

    // Reset transforms
    task.start.square.transform({ rotation: 0, scale: 1 });
    rotateSlider.value = "0";
    scaleSlider.value = "100";

    // ---- Rotation Slider ----
    rotateSlider.oninput = function () {
        currentRotation = parseFloat(this.value);
        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });
    };

    // ---- Scale Slider ----
    scaleSlider.oninput = function () {
        currentScale = parseFloat(this.value) / 100;
        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });
    };

    // Optional: Click to toggle dragging on/off (visual indicator can be added here)
    task.start.square.on("click", () => {
        isDragging = !isDragging;
        task.start.square.stroke({
            color: isDragging ? "#ffaa00" : "black",
            width: 2
        });
    });
});

// Start the tasks
judge.setup();
