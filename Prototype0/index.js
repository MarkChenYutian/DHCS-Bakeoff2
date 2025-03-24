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
  scaleSlider.max = "300"; // 300%
  scaleSlider.value = "100";
  scaleSlider.style.width = "100%";
 
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
  let currentRotation = 0;
  let currentScale = 1;
  let isDragging = false;
 
  // These "SVG groups" will hold the squares. I could put other things in these groups, and then everything would move together.
  let manipulator = svg.group();
  let goal = svg.group();
 
 
  function applyTransform() {
      manipulator.transform({
          rotation: currentRotation,
          scale: currentScale,
          translateX: manipulator.cx(),
          translateY: manipulator.cy()
      });
  }
 
   svg.on("mousemove", (e) => {
       if (isDragging) {
           manipulator.center(e.offsetX, e.offsetY);
           applyTransform(); // keeps rotation & scale
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
 
      currentRotation = 0;
 					currentScale = task.start.size / 100;  // task.start.size is usually like 100
 					manipulator.center(task.start.position.x, task.start.position.y);
 					applyTransform();
 
 					rotateSlider.value = "0";
 					scaleSlider.value = currentScale * 100;
 
       // Reset transforms and sliders when new task starts
      task.start.square.transform({rotation: 0, scale: 1});
      rotateSlider.value = "0";
      scaleSlider.value = "100";
 
   			// Slider Handles
 		   rotateSlider.oninput = function() {
 	    currentRotation = parseInt(this.value);
 	    applyTransform();
 				};
 	    scaleSlider.oninput = function() {
 	    currentScale = parseInt(this.value) / 100;
 	    applyTransform();
 				};
 
      // Handler Dragging
     task.start.square.on("click", () => {
         isDragging = !isDragging;
         if (isDragging) {
             task.start.square.stroke({color: active_borderColor, width: 2});
             controller_handle.innerHTML = "Active";
         } else {
             task.start.square.stroke({color: inactive_borderColor, width: 2});
             controller_handle.innerHTML = "Inactive";
         }
     });
 });
 
  // once you've got your handlers set up, start it up:
  judge.setup();
