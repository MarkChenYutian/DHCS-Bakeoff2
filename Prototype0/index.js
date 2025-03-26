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

// SVG groups
let manipulator = svg.group();
let goal = svg.group();

// Mouse events for dragging
svg.on("mousedown", (e) => {
    if (manipulator && manipulator.children().length > 0) {
        isDragging = true;
    }
});

svg.on("mousemove", (e) => {
    if (isDragging) {
        manipulator.center(e.offsetX, e.offsetY);
    }
});

svg.on("mouseup", (e) => {
    isDragging = false;
});

// Handle new task
judge.on("newTask", () => {
    let task = judge.getCurrentTask();

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
        task.start.square.transform({
            rotation: this.value,
            scale: scaleSlider.value / 100,
            origin: 'center'
        });
    };

    // ---- Scale Slider ----
    scaleSlider.oninput = function () {
        task.start.square.transform({
            scale: this.value / 100,
            rotation: rotateSlider.value,
            origin: 'center'
        });
    };

    // Optional: Click to toggle dragging on/off (visual indicator can be added here)
    task.start.square.on("click", () => {
        isDragging = !isDragging;
    });
});

// Start the tasks
judge.setup();
