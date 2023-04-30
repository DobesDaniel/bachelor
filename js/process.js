/*
    process.js
    author: Daniel Dobeš

    processing data from html

*/

const preProcessData = (input_string, id="") => {
    
    let validity = null;
    let value = null;
    let error_msg = "";
    
    
    if (input_string.length < 1) {
        error_msg = "There is no formula."
        error_container.style.display = 'block';
        error_message.innerText = error_msg + " Please enter a valid input.";
    }
    else {
        clearTables();

        const parent_element = document.getElementById("tables");
        const parent_div = document.createElement("div");
        parent_div.classList.add("tables-header")
        
        // add formula that is being displayed
        const new_h2 = document.createElement("h2");
        new_h2.textContent = "Formula: " + input_string;
        new_h2.style.marginTop = "5%";
        new_h2.style.marginLeft = "20%";
        
        // add download button
        const download_button = document.createElement('download-button');
        download_button.textContent = 'Download';
        download_button.classList.add('button');
        download_button.addEventListener('click', () => downloadContent(input_string));
        
        
        parent_div.appendChild(download_button);
        parent_div.appendChild(new_h2);
        parent_element.appendChild(parent_div);

        [validity, value, error_msg] = isValidFormula(input_string);
        
        // if valid -> add to history, and process
        if (validity) {
            error_container.style.display = 'none';
            processData(input_string);
            addToHistory(input_string);
        } else {
            error_container.style.display = 'block';
            //error_message.innerText = 'Invalid input. Please enter a valid input.';
            error_message.innerText = error_msg + " Please enter a valid input.";
        }
    }

}

const processData = (input_string, index="") => {
    //clearTables();
    const formula = new FormulaTree(input_string);
    const id = index.toString();

    const truth_table_checkbox = document.getElementById("checkbox-truth-table");
    if (truth_table_checkbox.checked) { doTruthTable(formula,id);}

    const indirect_proof_checkbox = document.getElementById("checkbox-indirect-proof");
    if (indirect_proof_checkbox.checked) { doIndirectProof(formula,id);}

    const resolution_checkbox = document.getElementById("checkbox-resolution");
    if (resolution_checkbox.checked) { doResolution(formula,id);}


};

const doTruthTable = (formula, id="") => {
    //console.log("doing truth table");

    let is_tautology = null;
    let truth_table = null;
    let variable_count = null;
    let result_col_idx = null;
    
    [is_tautology, truth_table, variable_count, result_col_idx] = formula.getTruthTable();

    const description = is_tautology? "This formula is Tautology" : "This formula is not a Tautology";
    const caption = "Truth table: " + description;


    const table = createTable("truth-table-"+id, truth_table, "", 2);
    table.resetTableStyles();
    table.highlightColumn(result_col_idx, is_tautology);
    for (let col = 0; col < variable_count; col++) { table.addColumnBorder(col);}
    table.addRowBorder(truth_table.length);
    table.addRowDescription(1,"hierarchical order");

    
    const table_element = document.getElementById("truth-table-"+id);
    const parent_element = table_element.parentNode;

    const table_title = document.createElement('h3');
    table_title.innerText = caption;
    table_title.classList.add("default-element-properties");
    parent_element.insertBefore(table_title, table_element); 


}

const doIndirectProof = (formula, id="") => {
    //console.log("doing indirect_proof");
    
    let is_tautology = null;
    let indirect_proof_table = null;
    let mismatched_variables = null;
    let result_col_idx = null;

    [is_tautology, indirect_proof_table, mismatched_variables, result_col_idx] = formula.getIndirectProof();

    const description = is_tautology? "This formula is Tautology" : "This formula is not a Tautology";
    const caption = "Indirect proof: " + description;

    const table = createTable("indirect_proof-table-"+id, indirect_proof_table, "", 2);
    table.highlightColumn(result_col_idx, null);  // highlight column with result evaluation
    table.addRowBorder(2);
    table.addRowBorder(indirect_proof_table.length);
    table.addRowDescription(1,"hierarchical order");

    if (is_tautology){
        //highlight mismatched variables - that disproves possible false evaluation
        for (let r = 0; r < indirect_proof_table.length; r++){
            for (let c = 0; c < indirect_proof_table[0].length; c++){
                if (indirect_proof_table[0][c] === mismatched_variables[r]) table.highlightCell(r+2,c, false);
            }
        }
    }
    table.resetTableStyles();

    const table_element = document.getElementById("indirect_proof-table-"+id);
    const parent_element = table_element.parentNode;

    const table_title = document.createElement('h3');
    table_title.innerText = caption;
    table_title.classList.add("default-element-properties");
    parent_element.insertBefore(table_title, table_element); 


}

const doResolution = (formula, id="") => {
    //console.log("doing resolution");
    let is_tautology = null;
    let resolution_table = null;
    let empty_clause_row_idx = null;
    let steps = null;

    [is_tautology, resolution_table, empty_clause_row_idx, steps] = formula.getResolution();

    const description = is_tautology? "This formula is Tautology" : resolution_table.length===1?"This formula is Contradiction (CNF is empty)":"This formula is not a Tautology";
    const caption = "Resolution: " + description;

    const table = createTable("resolution-table-"+id, resolution_table, "");
    if (empty_clause_row_idx) table.highlightRow(empty_clause_row_idx, true);
    table.resetTableStyles();

    const table_element = document.getElementById("resolution-table-"+id);
    const parent_element = table_element.parentNode;

    const table_title = document.createElement('h3');
    table_title.innerText = caption;
    table_title.classList.add("default-element-properties");
    parent_element.insertBefore(table_title, table_element); 

    for (let step_idx = 0; step_idx < steps.length; step_idx++){
        const step = "Step " + (step_idx+1) + ". " + steps[step_idx];
        const div = createDiv(id+"resolution-div-step"+step_idx, step);
        parent_element.insertBefore(div, table_element);    
    }
}

const processMultipleData = (input_string_data) => {

    // show download button when processed
    // output as?

    clearTables();

    const truth_table_checkbox = document.getElementById("checkbox-truth-table");
    const indirect_proof_checkbox = document.getElementById("checkbox-indirect_proof");
    const resolution_checkbox = document.getElementById("checkbox-resolution");
    
    let validity = null;
    let value = null;
    let error_msg = null;
    
    const input_field = document.getElementById("input-field");
    input_field.value = "";

    let all_valid_formula_strings = "";
    const parent_element = document.getElementById("tables");

    input_string_data.forEach((input_string, index) => {
        
        // is there any formula?
        if(input_string.length > 1){
            // add formula that is being displayed
            
            const parent_div = document.createElement("div");
            parent_div.classList.add("tables-header")
            
            // add formula that is being displayed
            const new_h2 = document.createElement("h2");
            new_h2.textContent = "Formula: " + input_string;
            new_h2.style.marginTop = "5%";
            new_h2.style.marginLeft = "20%";
            
            // add download button
            const download_button = document.createElement('download-button');
            download_button.textContent = 'Download';
            download_button.classList.add('button');
            download_button.addEventListener('click', () => downloadContent(input_string));
            
            
            parent_div.appendChild(download_button);
            parent_div.appendChild(new_h2);
            parent_element.appendChild(parent_div);
            
            [validity, value, error_msg] = isValidFormula(input_string);    // there is an error

            if (validity){
                processData(input_string, index.toString());
                all_valid_formula_strings += input_string + "\n";
            }
            else {
                const new_h3 = document.createElement("h3");
                new_h3.textContent = error_msg;
                new_h3.style.fontSize = "20px";
                new_h2.appendChild(new_h3);  
            }
        }
    });

    // add download button
    const download_button = document.createElement('download-button');
    download_button.textContent = 'Download all valid formulas';
    download_button.classList.add('button');
    download_button.addEventListener('click', () => downloadContent(all_valid_formula_strings));
    
    const parent_div = document.createElement("div");
    parent_div.classList.add("tables-header")
            
    //parent_element.insertBefore(document.createElement('br'), parent_element.firstChild);
    parent_div.appendChild(download_button);
    parent_element.insertBefore(parent_div, parent_element.firstChild);


}

const validateInput = (input_string) => {
    let validity = false;
    let value = null;
    let error_msg = "";
    
    if (input_string.length < 1) {
        error_msg = "There is no formula.";
    }
    else {
        [validity, value, error_msg] = isValidFormula(input_string);
    }
    return [validity, value, error_msg];
}