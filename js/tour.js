/*
    tour.js
    author: Daniel Dobeš

    contains functions to ensure the possibility of touring the site
    also tour step definitions
    
*/

    var tour_steps = [
      {
        title: "Welcome!",
        text: "Lets start with tour.",
        position: { top: "50%", left: "50%" },
        preShow: (step) => {
            window.scrollTo(0,0);
            previous_button.innerText = "Close";
            next_button.innerText = "Start";
        },
        postHide: () => {
        }
      },
      {
        title: "Step 1",
        text: "Choose between Formula and Argument, on what you want to test.",
        position: { top: "10%", left: "55%" },
        element_id: "tour-step-1",
        preShow: function(step) {
            previous_button.innerText = "Previous";
            next_button.innerText = "Next";

            const elements = document.getElementsByClassName(this.element_id);
            Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
            const elements = document.getElementsByClassName(this.element_id);
            Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "Step 2a",
        text: "If you chose formula, enter your formula in text input or just drag'n'drop file with formulas on this website.",
        position: { top: "15%", left: "22%" },
        element_id: "tour-step-2a",
        preShow: function(step) {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "Step 2b",
        text: "If you chose argument, enter premises of the argument and conclusion that u want to test in text inputs",
        position: { top: "13%", left: "68%" },
        element_id: "tour-step-2b",
        preShow: function(step) {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "Step 3a",
        text: "Decide what methods, would you like to use.",
        position: { top: "28%", left: "20%" },
        element_id: "tour-step-3a",
        preShow: function(step) {
          const static_radio = document.getElementById('radio-static');
          if (static_radio.checked) { step.position = { top: "28%", left: "20%" }; }
          else {step.position ={ top: "38%", left: "20%" }; }
          
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "Step 3b",
        text: "If you are not sure, how each metod works, check describtion.",
        position: { top: "25%", left: "55%" },
        element_id: "tour-step-3b",
        preShow: function(step) {
          if (static_radio.checked) { step.position = { top: "28%", left: "55%" }; }
          else {step.position = { top: "38%", left: "55%" }; }
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "Step 4",
        text: "Press Process button.",
        position: { top: "22%", left: "82%" },
        element_id: "tour-step-4",
        preShow: function(step) {
          if (static_radio.checked) { step.position = { top: "22%", left: "82%" }; }
          else {step.position = { top: "32%", left: "82%" }; }
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.add("highlighted"));
        },
        postHide: function() {
          const elements = document.getElementsByClassName(this.element_id);
          Array.from(elements).forEach(element => element.classList.remove("highlighted"));
        },
      },
      {
        title: "See results!",
        text: "You can also download formulas, that you can see results for.",
        position: { top: "50%", left: "50%" },
        preShow: function (step) {
            previous_button.innerText = "Previous";
            next_button.innerText = "End";
        },
        postHide: function () {},
      }
    ];
  
    // Initialize tour
    var current_step_idx = 0;
    var tour_modal = document.getElementById("tour-modal");
    var tour_content = document.getElementById("tour-content");
    var tour_title = document.getElementById("tour-title");
    var tour_text = document.getElementById("tour-text");
    var previous_button = document.getElementById("button-tour-prev");
    var next_button = document.getElementById("button-tour-next");
    var start_tour_button = document.getElementById("button-start-tour");
  
    // Function to show current step
    function showStep(step) {
        
        
        tour_steps[step].preShow(tour_steps[step]);

        
        tour_title.innerText = tour_steps[step].title;
        tour_text.innerText = tour_steps[step].text;
        tour_content.style.top = tour_steps[step].position.top;
        tour_content.style.left = tour_steps[step].position.left;

        //tour_steps[step].postHide();

    }
  
    // Function to show previous step
    function prevStep() {
        tour_steps[current_step_idx].postHide();
        if (current_step_idx > 0) {
            current_step_idx--;
            showStep(current_step_idx);
        }
        else {
            tour_modal.style.display = "none";
        }
    }
  
    // Function to show next step
    function nextStep() {
        tour_steps[current_step_idx].postHide();
        if (current_step_idx < tour_steps.length - 1) {
            current_step_idx++;
            showStep(current_step_idx);
        } 
        else {
            tour_modal.style.display = "none";
        }
    }
  
    // Function to start tour
    function startTour() {
        current_step_idx = 0;
        showStep(current_step_idx);
        window.scrollTo(0,0); // Scroll to top of the page
        tour_modal.style.display = "block";
    }

  
    // Add event listener to start tour button
    start_tour_button.addEventListener("click", startTour);
  
    // Add event listener to previous button
    previous_button.addEventListener("click", prevStep);
  
    // Add event listener to next button
    next_button.addEventListener("click", nextStep);