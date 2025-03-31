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

// =================== Refer to HTML elements ===================
const main_container = document.getElementById("main");
const dbg_console    = document.getElementById("dbg-console");

// =========== Utility Functions ==============

const remain_task_progress = document.getElementById("remain-task-cnt-prog");
const remain_task_text     = document.getElementById("remain-task-cnt-text");
function UpdateProgressBar(judge) {
    const task_number = judge.getTaskNumber() + 1;
    remain_task_progress.max = tasksLength;
    remain_task_progress.value = task_number;
    remain_task_progress.innerHTML = tasksLength - task_number;
    remain_task_text.innerHTML = `${task_number}/${tasksLength}`;
}

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
    scalingSquareCenterX = center_x;
    scalingSquareCenterY = center_y;

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
        ]).fill(goalColor);
    });

    // Register callback for each of the scaling controller
    scaling_controller = polygons;
    scaling_controller.forEach(controller => {
        controller.on("mouseenter", () => {
            controller.fill(highlightColor);
            main_container.style.cursor = "ew-resize";
        });

        controller.on("mouseleave", () => {
            controller.fill(goalColor);
            main_container.style.cursor = "default";
        });

        controller.on("mousedown", (e) => {
            isDragging = true;
            interaction_type = "scale";

            // Get the SVG point from the mouse event
            const svgPoint = svg.node.createSVGPoint();
            svgPoint.x = e.clientX;
            svgPoint.y = e.clientY;
            const screenCTM = svg.node.getScreenCTM().inverse();
            const svgCoords = svgPoint.matrixTransform(screenCTM);

            // Store the initial mouse position
            dragStartX = svgCoords.x;
            dragStartY = svgCoords.y;

            // Store the original square position
            originalSquareX = currentTranslate.x;
            originalSquareY = currentTranslate.y;
        });
    }
    );
    
    // Add the rotate manipulator UI to the manipulator group
    rotate_controller = manipulator.circle(15).fill(goalColor);
    const direction_vector = {x: (midpoints[0].x - center_x), y: (midpoints[0].y - center_y) };
    const norm = Math.sqrt(direction_vector.x ** 2 + direction_vector.y ** 2);
    rotate_controller.center(
        midpoints[0].x + (45 / norm) * direction_vector.x,
        midpoints[0].y + (45 / norm) * direction_vector.y
    );
    rotate_controller.on("mouseenter", () => {
        rotate_controller.fill(highlightColor);
        main_container.style.cursor = "crosshair";
    });
    rotate_controller.on("mouseleave", () => {
        rotate_controller.fill(goalColor);
        main_container.style.cursor = "default";
    });
    rotate_controller.on("mousedown", (e) => {
        isDragging = true;
        interaction_type = "rotate";

        // Get the SVG point from the mouse event
        const svgPoint = svg.node.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const screenCTM = svg.node.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(screenCTM);

        // Store the initial mouse position
        dragStartX = svgCoords.x;
        dragStartY = svgCoords.y;

        // Store the original square position
        originalSquareX = currentTranslate.x;
        originalSquareY = currentTranslate.y;
    });

    manipulator.line(center_x, center_y, rotate_controller.cx(), rotate_controller.cy()).stroke({ color: goalColor, width: 2, dasharray: '5,5' });
}

// =========== Main Setup ===========

// Colors
const startColor = "#6677EEAA"; 
const goalColor = "#707070";
const highlightColor = "#ffaa00";  // Highlight color

// Dragging variables
let isDragging = false;
let dragStartX, dragStartY;
let originalSquareX, originalSquareY;
let scalingSquareCenterX, scalingSquareCenterY;
let dragScale = 1;

// Tracks the current transformation state
let interaction_type = "none";  // | translate | rotate | scale
let scaling_controller = [];    // Will be filled in when setup manipulator
let rotate_controller;          // Will be filled in when setup manipulator
let currentRotation = 0;
let currentScale = 1;
let currentTranslate = { x: 0, y: 0 };
let task; 

// SVG groups
let manipulator = svg.group();
let goal = svg.group();

// Handle new task
judge.on("newTask", () => {
    task = judge.getCurrentTask();
    UpdateProgressBar(judge);

    // Clear previous manipulator and goal squares
    manipulator.clear();
    goal.clear();

    // Style start and goal squares
    task.start.square.fill(startColor);
    task.goal.square.fill('none');
    task.goal.square.stroke(goalColor);

    // Reset transforms
    task.start.square.transform({ rotation: 0, scale: 1 });
    currentRotation = 0;
    currentScale = 1;
    currentTranslate = { x: 0, y: 0 };
    // Store the original square position
    originalSquareX = currentTranslate.x;
    originalSquareY = currentTranslate.y;

    // Add squares to groups
    setupManipulator(manipulator, task.start.square);
    goal.add(task.goal.square);

    // Add highlight on mouse enter
    task.start.square.on("mouseenter", () => {
        task.start.square.stroke({
            color: highlightColor,
            width: 3 / task.start.square.transform().scaleX
        });
        main_container.style.cursor = "move";
    });

    // Remove highlight on mouse leave
    task.start.square.on("mouseleave", () => {
        task.start.square.stroke({
            color: goalColor,
            width: 3 / task.start.square.transform().scaleX
        });
        main_container.style.cursor = "default";
    });

    // Drag event handlers specific to this task's square
    task.start.square.on("mousedown", (e) => {
        isDragging = true;
        interaction_type = "translate";
        
        // Get the SVG point from the mouse event
        const svgPoint = svg.node.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const screenCTM = svg.node.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(screenCTM);
        
        // Store the initial mouse position
        dragStartX = svgCoords.x;
        dragStartY = svgCoords.y;
    });
});

// Global mouse move and up events
svg.on("mousemove", (e) => {
    dbg_console.innerText = `Interaction: ${interaction_type}, isDragging: ${isDragging}, currentScale: ${currentScale}, dragScale: ${dragScale}, OrigSquareX: ${scalingSquareCenterX}, OrigSquareY: ${scalingSquareCenterY}`;
    
    if (isDragging && task && interaction_type === "translate") {
        // Get the SVG point from the mouse event
        const svgPoint = svg.node.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const screenCTM = svg.node.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(screenCTM);
        
        // Calculate the difference in mouse movement
        const deltaX = svgCoords.x - dragStartX;
        const deltaY = svgCoords.y - dragStartY;
        
        // Update translation, preserving previous transformations
        currentTranslate.x = originalSquareX + deltaX;
        currentTranslate.y = originalSquareY + deltaY;
        
        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });
        manipulator.clear()
        setupManipulator(manipulator, task.start.square);
    } else if (isDragging && task && interaction_type === "scale") {
        // Get the SVG point from the mouse event
        const svgPoint = svg.node.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const screenCTM = svg.node.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(screenCTM);

        // Calculate the difference in mouse movement
        const deltaX = svgCoords.x - scalingSquareCenterX;
        const deltaY = svgCoords.y - scalingSquareCenterY;

        // Update scale, preserving previous transformations
        let currentDragDist = Math.sqrt((deltaX) ** 2 + (deltaY) ** 2);
        let originalDragDist = Math.sqrt((dragStartX - scalingSquareCenterX) ** 2 + (dragStartY - scalingSquareCenterY) ** 2);
        dragScale = currentDragDist / originalDragDist;

        if (dragScale < 0.05) {
            dragScale = 0.05;
        }

        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale * dragScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });

        manipulator.clear();
        setupManipulator(manipulator, task.start.square);
    } else if (isDragging && task && interaction_type === "rotate") {
        // Get the SVG point from the mouse event
        const svgPoint = svg.node.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const screenCTM = svg.node.getScreenCTM().inverse();
        const svgCoords = svgPoint.matrixTransform(screenCTM);

        // Calculate the difference in mouse movement
        const deltaX = svgCoords.x - scalingSquareCenterX;
        const deltaY = svgCoords.y - scalingSquareCenterY;

        // Calculate the angle
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        // Update rotation, preserving previous transformations
        currentRotation = angle;
        task.start.square.transform({
            rotate: currentRotation,
            scale: currentScale,
            translate: [currentTranslate.x, currentTranslate.y],
            origin: 'center'
        });

        manipulator.clear();
        setupManipulator(manipulator, task.start.square);
    }
});

svg.on("mouseup", () => {
    isDragging = false;
    interaction_type = "none";
    currentScale = currentScale * dragScale;
    dragScale = 1;
    task.start.square.stroke({
        color: goalColor,
        width: 3 / task.start.square.transform().scaleX
    });
});

svg.on("mouseleave", () => {
    isDragging = false;
    interaction_type = "none";
    currentScale = currentScale * dragScale;
    dragScale = 1;
    task.start.square.stroke({
        color: goalColor,
        width: 3 / task.start.square.transform().scaleX
    });

    manipulator.clear();
    setupManipulator(manipulator, task.start.square);
});

// Start the tasks
judge.setup();
