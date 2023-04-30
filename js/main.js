/*
    main.js
    author: Daniel Dobeš

    contains default scripts
    used for setting listeners and basic features

*/

const input_field = document.getElementById('input-field');
const formula_process_button = document.getElementById('process-button-formula');

const error_container = document.getElementById('error-container');
const error_message = document.getElementById('error-message');

const max_history_size = 5;
const dropdown = document.getElementById('input-dropdown');
const list = document.getElementById('input-history-list');
let history = [];

const default_history = ["a and b", "a imp b imp a", "p or not q", "p equ T"];

input_field.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        formulaEntered();
    }
});

formula_process_button.addEventListener('click', function() {
    formulaEntered();
});

function formulaEntered(){
    clearTables();
    preProcessData(input_field.value);
}

// Add event listener to each checkbox - to save all states to local storage
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
        const states = [];
        checkboxes.forEach((cb) => {
        states.push(cb.checked);
        });
        localStorage.setItem('checkboxStates', JSON.stringify(states));
    });
});

// Load last state of checkboxes from local storage
window.addEventListener('load', () => {
    history = JSON.parse(localStorage.getItem('history')) || default_history;
    //history = default_history;
    updateDropdown();
    const checkboxesStates = JSON.parse(localStorage.getItem('checkboxStates'));
    if (checkboxesStates) {
        checkboxes.forEach((checkbox, index) => {
        checkbox.checked = checkboxesStates[index];
        });
    }

    const static_radio = document.getElementById('radio-static');
    const dynamic_radio = document.getElementById('radio-dynamic');
    const last_checked = localStorage.getItem('last_checked');
    if (last_checked === 'static') { static_radio.checked = true; } 
    else if (last_checked === 'dynamic') { dynamic_radio.checked = true; }
    toggleInputFields();    // show correct inputs on load
});

// add new item to history
function addToHistory(string){
    if (history.includes(string)) return;
    history.unshift(string);
    if (history.length > max_history_size) {
        history.splice(max_history_size);
    };
    localStorage.setItem('history', JSON.stringify(history));            

    updateDropdown();
}

// bind data list to dropdown list
function updateDropdown(){
    list.innerHTML = "";
    history.forEach((str) => {
        const list_item = document.createElement('li');
        list_item.textContent = str;
        list.appendChild(list_item);
    });

}

// selection from history list on click
dropdown.addEventListener('mousedown', () => {
    if (event.target.tagName === 'LI') {
        input_field.value = event.target.textContent;
        input_field.focus();
        dropdown.style.display = 'none';
    }
});


// history dropdown
input_field.addEventListener('input', handleDropdownDisplay);
input_field.addEventListener('click', handleDropdownDisplay);

function handleDropdownDisplay() {
    const string = input_field.value.trim();
    if (string.length > -1) {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
};

// When the input field loses focus, hide the dropdown
input_field.addEventListener('blur', () => {
dropdown.style.display = 'none';
});

// drag and drop feature
const drop_zone = document.getElementById("drop-zone");
document.addEventListener("dragover",e => { 
    e.preventDefault();
    drop_zone.style.display = "flex";
});
drop_zone.addEventListener("dragleave", e => {
    e.preventDefault();
    drop_zone.style.display = "none";
});

drop_zone.addEventListener("drop", e => {
    e.preventDefault();
    drop_zone.style.display = "none";

    const file = e.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const file_content = reader.result;
        const lines = file_content.split('\n');
        processMultipleData(lines);
    };

    reader.readAsText(file);
});

// handeling switching input types
function toggleInputFields() {
    const judgement_input = document.getElementById('judgement-input');
    const formula_input = document.getElementById('formula-input');
    const static_radio = document.getElementById('radio-static');
    if (static_radio.checked) {
        judgement_input.style.display = "none";
        formula_input.style.display = "block";
        localStorage.setItem('last_checked', 'static');
    }
    else {
        judgement_input.style.display = "block";
        formula_input.style.display = "none";
        localStorage.setItem('last_checked', 'dynamic');
    }    
}

const static_radio = document.getElementById("radio-static");
const dynamic_radio = document.getElementById("radio-dynamic");
static_radio.addEventListener("click", () => {toggleInputFields();});
dynamic_radio.addEventListener("click", () => {toggleInputFields();});

const radio_buttons = document.querySelectorAll('input[type="radio"]');
radio_buttons.forEach((radio_button) => {
    radio_button.addEventListener('click', () => {
        toggleInputFields();
    });
});



function addPremiseInputField() {
    const premises_container = document.getElementById('premises-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'dynamic-input';
    input.addEventListener('input', handlePremiseInput);
    premises_container.appendChild(input);
    last_input = input;
}

function removePremiseInputField(input) {
    const premises_container = document.getElementById('premises-container');
    if (input.value === '' && input !== last_input && input !== premises_container.firstChild) {
        premises_container.removeChild(input);
    }
}

function handlePremiseInput(event) {
    const premises_container = document.getElementById('premises-container');
    const inputs = premises_container.getElementsByTagName('input');
    const empty_inputs = Array.from(inputs).filter(input => input.value === '');
    if (empty_inputs.length === 0 && inputs.length < 10) {
        addPremiseInputField();
    }
    else {
        removePremiseInputField(event.target);
    }
}

const judgement_process_button = document.getElementById("process-button-judgement");
judgement_process_button.addEventListener('click', function() {
    judgementEntered();
});

function judgementEntered(){
    clearTables();
    
    console.log("judgementEntered");

    const error_msgs = document.getElementsByClassName("premise-error-message");
    Array.from(error_msgs).forEach((error_msg) => { error_msg.remove(); });
    
    console.log("error msgs removed");

    const premises_container = document.getElementById('premises-container');
    const inputs = premises_container.getElementsByTagName('input');
    const non_empty_inputs = Array.from(inputs).filter(input => input.value !== '');
    
    let all_valid = true;
    const formula_values = [];
    for (let premise_input of non_empty_inputs){
        const [valid, value, error_msg] = validateInput(premise_input.value);
        all_valid = all_valid && valid;
        if (!valid){
            const premise_error_message = "<span class='premise-error-message'>Invalid input!</span>";
            premise_input.insertAdjacentHTML('afterend', premise_error_message);
        }
        formula_values.push(value);
    }

    // validate conclusion
    const conclusion_input = document.getElementById("conclusion-input");
    const [valid, value, error_msg] = validateInput(conclusion_input.value);
    all_valid = all_valid && valid;

    const conclusion_error_message = document.getElementById("conclusion-error-message");
    if (!valid){ conclusion_error_message.innerText = error_msg + " Please enter a valid input.";}
    else {conclusion_error_message.innerText = ""};
    
    let formula_string = "";
    // inputs are valide -> create formula to test
    if (all_valid){
        
        // add all premises
        for (let idx = 0; idx < formula_values.length; idx++) {
            if (idx!==0) formula_string += " and ";
            formula_string += "(" + formula_values[idx] + ")";
        }

        // add conclusiong
        formula_string += " imp " + value;

        preProcessData(formula_string);

    }
    
}

function downloadContent(content) {
    //const content = "download test...";
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'formula.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// adding event listenery to show/hide description for methods
const buttons = document.querySelectorAll('.button-description');
buttons.forEach((button) => {
    const description_id = button.getAttribute('id').replace('button-', '');
    const description = document.getElementById(description_id);
    button.addEventListener('click', () => {
        if (description.style.display === 'none') {
        description.style.display = 'block';
        button.textContent = '-';
        } else {
        description.style.display = 'none';
        button.textContent = '+';
        }
    });
});
