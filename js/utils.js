/*
    utils.js
    author: Daniel Dobeš

    utility functions for mapping data from js into html
    - createTable, crateDiv
*/

function createTable(table_id, data, caption_text=null, header_row_count=1) {
    // Remove old table if it exists
    const old_table = document.getElementById(table_id);
    if (old_table) {
        old_table.remove();
    }
  
    // Create new table element
    const table = document.createElement('table');
    table.id = table_id;
  
    // Add caption if provided
    if (caption_text) {
        const caption = document.createElement('caption');
        caption.textContent = caption_text;
        table.appendChild(caption);
    }


    // Create header rows
    for (let i = 0; i < header_row_count; i++) {
    const header_row = document.createElement('tr');
    data[i].forEach((colData) => {
        const th = document.createElement('th');
        th.textContent = colData;
        header_row.appendChild(th);
    });
    table.appendChild(header_row);
}
    
    // Create data rows
    for (let i = header_row_count; i < data.length; i++) {
        const row = document.createElement('tr');
        data[i].forEach((cellData, j) => {
            const td = document.createElement('td');
            td.textContent = cellData===true?1:cellData===false?0:cellData;              // exchanging true/false -> 0/1
            row.appendChild(td);
        });
        table.appendChild(row);
    }

    // Add table to DOM into div tables
    // Create new div element
    const new_div = document.createElement('div');
    new_div.appendChild(table);
    
    const parent_div = document.getElementById('tables');
    parent_div.appendChild(new_div);

    //Remove any previously added borders or highlighting
    //const existingStyles = document.querySelectorAll(`#${table_id}-styles`);
    //existingStyles.forEach((style) => style.remove());
    
    // Highlight specified column
    function highlightColumn(column_idx, possitive=null) {
        const rows = table.rows;
        const highlight_style = possitive===null ? "highlightNeutral": possitive ? "highlightPossitive" : "highlightNegative";
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[column_idx].classList.add(highlight_style);
        }
    }
  
    // Highlight specified row
    function highlightRow(row_idx, possitive=null) {
        const rows = table.rows;
        const highlight_style = possitive===null ? "highlightNeutral": possitive ? "highlightPossitive" : "highlightNegative";
        for (let i = 0; i < rows[row_idx].cells.length; i++) {
            rows[row_idx].cells[i].classList.add(highlight_style);
        }
    }

    // Highlight specified cell
    function highlightCell(row_idx, column_idx, possitive=null) {
        const highlight_style = possitive===null ? "highlightNeutral": possitive ? "highlightPossitive" : "highlightNegative";
        table.rows[row_idx].cells[column_idx].classList.add(highlight_style);
    }
  
    // Add border behind specified column
    function addColumnBorder(column_idx) {
        const style = document.createElement('style');
        style.id = `${table_id}-border`;
        style.innerHTML = `
            #${table_id} tr td:nth-child(${column_idx + 1}),
            #${table_id} tr th:nth-child(${column_idx + 1}) {
            border-right: 1px solid black;
            }
        `;
        document.head.appendChild(style);
        table.classList.add('bordered');
    }

    // Add border under specific row
    function addRowBorder(row_idx) {
        const style = document.createElement('style');
        style.id = `${table_id}-border`;
        style.innerHTML = `
        #${table_id} tr:nth-child(${row_idx+1}) td {
            border-bottom: 1px solid black;
        }
        `;
        document.head.appendChild(style);
        table.classList.add('bordered');
    }
  
    // Remove highlighting and borders
    function resetTableStyles() {
        table.classList.remove('bordered');
        const highlighted_cells = table.querySelectorAll('.highlighted');
        highlighted_cells.forEach((cell) => cell.classList.remove('highlighted'));
        const existing_border = document.getElementById(`${table_id}-border`);
        if (existing_border) {
            existing_border.remove();
        }
    }
  
    function addRowDescription(row_idx, tooltipText) {
        const rows = document.querySelectorAll(`#${table_id} tr`);
        const row = rows[row_idx];
        row.classList.add('table-tooltip');
        row.setAttribute('title', tooltipText);
      }
      
    return {
        highlightColumn,
        highlightRow,
        highlightCell,
        addColumnBorder,
        addRowBorder,
        resetTableStyles,
        addRowDescription,
    };
  }

function clearTables() {
    const div = document.getElementById("tables");
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  }

function createDiv(divId, text){
    // Remove old div if it exists
    const old_div = document.getElementById(divId);
    if (old_div) {
        old_div.remove();
    }
  
    // Create new div element
    const div = document.createElement('div');
    div.id = divId;
    div.textContent = text;
    div.classList.add("default-element-properties");
    div.classList.add("description");
    return div;
}
  