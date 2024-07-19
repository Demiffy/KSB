document.addEventListener('DOMContentLoaded', function() {
    let container = document.querySelector('.classification-container');

    // Check if the container exists
    if (container) {
        chrome.storage.local.get("originalTableData", function(result) {
            if (result.originalTableData) {
                insertModernTables(result.originalTableData, container);
            } else {
                console.log("[Kyberna MB] No data found in local storage. Redirecting to fetch data...");
                // Save the current URL to local storage before redirecting
                chrome.storage.local.set({ "redirectBackUrl": window.location.href }, function() {
                    window.location.href = 'https://sis.ssakhk.cz/Classification/';
                });
            }
        });
    }

    // Event listener for the 'Add Grade' button
    const addButton = document.getElementById('známkaButton');
    addButton.addEventListener('click', function() {
        const selectedSubject = document.getElementById('tableTitlesDropdown').value;
        const newGrade = document.getElementById('známkaInput').value;
        const newWeight = document.getElementById('váhaInput').value;

        if (selectedSubject && newGrade && newWeight) {
            addGradeToTable(selectedSubject, newGrade, newWeight);
        }
    });

    const combobox = document.getElementById('tableTitlesDropdown');
    combobox.addEventListener('change', function() {
        const známkaInput = document.getElementById('známkaInput');
        const váhaInput = document.getElementById('váhaInput');
        
        if (combobox.value) {
            známkaInput.disabled = false;
            váhaInput.disabled = false;
        } else {
            známkaInput.disabled = true;
            váhaInput.disabled = true;
        }
    });

    // Reset button event listener
    const resetButton = document.getElementById('resetTablesButton');
    resetButton.addEventListener('click', function() {
        resetTables();
    });

    chrome.storage.local.get("lastFetchDate", function(result) {
        if (result.lastFetchDate) {
            const dateString = new Date(result.lastFetchDate).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });
            document.getElementById('lastFetchDate').innerText = dateString;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    checkAndApplyThemeStyles();
});


document.addEventListener('DOMContentLoaded', function() {
    const známkaInput = document.getElementById('známkaInput');

    známkaInput.addEventListener('input', function() {
        let value = známkaInput.value;

        if (value.includes('-')) {
            const parts = value.split('-');
            if (parts[0] === '' || parseInt(parts[0]) > 4) {
                value = value.replace('-', '');
            }
        }

        const isValid = /^([1-4]-?|5)$/.test(value);
        if (!isValid && value !== '') {
            známkaInput.value = value.slice(0, -1);
        } else {
            známkaInput.value = value;
        }
    });

    váhaInput.addEventListener('input', function() {
        const value = váhaInput.value;
        const isValid = /^[1-9]$|^10$/.test(value);
        if (!isValid && value !== '') {
            váhaInput.value = value.slice(0, -1);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const combobox = document.getElementById('tableTitlesDropdown');
    const známkaInput = document.getElementById('známkaInput');
    const váhaInput = document.getElementById('váhaInput');

    combobox.addEventListener('change', function() {
        if (combobox.value !== '') {
            známkaInput.disabled = false;
            váhaInput.disabled = false;
        } else {
            známkaInput.disabled = true;
            váhaInput.disabled = true;
        }
    });
});



function calculateWeightedAverage(tableData) {
    let totalWeight = 0;
    let totalSum = 0;

    for (let row of tableData) {
        let grade = parseGrade(row[1]);
        let weight = parseInt(row[3], 10);

        if (!isNaN(grade) && !isNaN(weight) && weight > 0) {
            totalSum += grade * weight;
            totalWeight += weight;
        }
    }

    if (totalWeight > 0) {
        return totalSum / totalWeight;
    } else {
        return 'N/A';
    }
}






function parseGrade(gradeStr) {
    if (gradeStr === 'n') {
        return 5.00;
    } else if (gradeStr.endsWith('-')) {
        return parseFloat(gradeStr.charAt(0)) + 0.5;
    }
    return parseFloat(gradeStr);
}


let originalTableData;
function insertModernTables(data, container) {
    if (!originalTableData) {
        originalTableData = JSON.parse(JSON.stringify(data));
    }
    container.innerHTML = '';

    // Extract table titles
    const tableTitles = data.map(([header]) => header);

    // Populate the combobox with table titles
    populateCombobox(tableTitles);

    // Iterate over each set of table data
    data.forEach(([header, ...tableData]) => {
        // Create a div for the table title
        let titleDiv = document.createElement('div');
        titleDiv.className = 'table-title';
        titleDiv.innerText = header;
        container.appendChild(titleDiv);

        // Create a table element
        let table = document.createElement('table');
        table.className = 'modern-table';

        // Create the header row
        let thead = document.createElement('thead');
        let headerRow = document.createElement('tr');
        tableData.shift().forEach(headerText => {
            let th = document.createElement('th');
            th.innerText = headerText;
            headerRow.appendChild(th);
        });

        // Add a <th> with text "Možnosti" for the remove button column
        let optionsHeader = document.createElement('th');
        optionsHeader.innerText = 'Možnosti';
        headerRow.appendChild(optionsHeader);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create the body of the table
        let tbody = document.createElement('tbody');

        // Calculate the new weighted average
        let average = calculateWeightedAverage(tableData.slice(0, -1));

        // Append rows to the table
        tableData.forEach((rowData, rowIndex) => {
            let row = document.createElement('tr');

            rowData.forEach((cellData, cellIndex) => {
                let td = document.createElement('td');
                td.innerText = cellData;

                if (rowIndex === tableData.length - 1 && cellIndex === 1) {
                    row.className = 'final-grade-row';
                    applyGradeColor(td, cellData);
                }

                row.appendChild(td);
            });

            if (rowIndex !== tableData.length - 1) {
                let buttonsCell = document.createElement('td');
                let removeButton = createButton('Odstranit', () => removeGrade(row, header), 'remove-grade-button');
                let editButton = createButton('Editovat', () => editGrade(row, 1, 3), 'edit-grade-button');
                buttonsCell.appendChild(removeButton);
                buttonsCell.appendChild(editButton);
                row.appendChild(buttonsCell);
            } else {
                let emptyCell = document.createElement('td');
                row.appendChild(emptyCell);
            }

            tbody.appendChild(row);
        });

        

        // Update the last row's 'Známka' value with the calculated average
        if (tableData.length > 0) {
            let lastRowCells = tbody.lastChild.cells;
            if (lastRowCells.length >= 2) {
                let finalGradeCell = lastRowCells[1];
                finalGradeCell.innerText = average.toFixed(2);
                applyGradeColor(finalGradeCell, average.toFixed(2));
            }
        }

        table.appendChild(tbody);

        container.appendChild(table);
    });
}


function createButton(text, onClickFunction, additionalClass = '') {
    let button = document.createElement('button');
    button.textContent = text;
    button.classList.add('grade-button');
    if (additionalClass) {
        button.classList.add(additionalClass);
    }
    button.onclick = onClickFunction;
    return button;
}

function editGrade(row, gradeCellIndex, weightCellIndex) {
    let gradeCell = row.cells[gradeCellIndex];
    let weightCell = row.cells[weightCellIndex];

    // Ensure the cell indices are within the bounds of the row cells
    if (gradeCellIndex >= row.cells.length || weightCellIndex >= row.cells.length) {
        console.error("Invalid cell index");
        return;
    }

    // Check if already in edit mode
    if (gradeCell.querySelector('input') && weightCell.querySelector('input')) {
        updateGrade(row, gradeCellIndex, weightCellIndex);
        return;
    }

     // Store current values before clearing the cells
     let currentGrade = gradeCell.innerText;
     let currentWeight = weightCell.innerText;

    // Transform grade cell to input field
    gradeCell.innerHTML = '';
    let gradeInput = createInputField(currentGrade, 20, 'grade');
    gradeCell.appendChild(gradeInput);

    // Transform weight cell to input field
    weightCell.innerHTML = '';
    let weightInput = createInputField(currentWeight, 20, 'weight');
    weightCell.appendChild(weightInput);

    // Setup blur event with a timeout to allow for focus switching
    let onBlur = function() {
        setTimeout(() => {
            if (document.activeElement !== gradeInput && document.activeElement !== weightInput) {
                updateGrade(row, gradeCellIndex, weightCellIndex);
            }
        }, 100);
    };

    gradeInput.addEventListener('blur', onBlur);
    weightInput.addEventListener('blur', onBlur);

    gradeInput.focus();
}

let lastValidValue = "";
function createInputField(value, width, type) {
    let input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.style.width = width + 'px';

    // Add event listeners based on the type of input
    if (type === 'grade') {
        input.addEventListener('input', function() {
            const cursorPosition = input.selectionStart;
            if (/^([1-4]-?|5)?$/.test(input.value)) {
                lastValidValue = input.value;
            } else {
                input.value = lastValidValue;
                input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
            }
        });
    } else if (type === 'weight') {
        input.addEventListener('input', function() {
            const cursorPosition = input.selectionStart;
            if (/^(10|[1-9])?$/.test(input.value)) {
                lastValidValue = input.value;
            } else {
                input.value = lastValidValue;
                input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
            }
        });
    }

    // Stop click event from propagating to parent elements
    input.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    return input;
}




function updateGrade(row, gradeCellIndex, weightCellIndex) {
    let gradeInput = row.cells[gradeCellIndex].querySelector('input');
    let weightInput = row.cells[weightCellIndex].querySelector('input');
    let newGrade = gradeInput.value;
    let newWeight = weightInput.value;

    row.cells[gradeCellIndex].innerText = newGrade;
    row.cells[weightCellIndex].innerText = newWeight;

    let table = row.closest('.modern-table');
    let subjectName = table.previousElementSibling.innerText;

    recalculateAverage(table, subjectName);
}


function removeGrade(row, subjectName) {
    let table = row.closest('.modern-table');
    table.deleteRow(row.rowIndex);
    recalculateAverage(table, subjectName);
}

function applyGradeColor(cell, gradeStr) {
    let grade = parseFloat(gradeStr.replace(',', '.'));
    if (!isNaN(grade)) {
        if (grade >= 1.0 && grade <= 1.49) {
            cell.style.color = 'lime';
        } else if (grade >= 1.5 && grade <= 2.49) {
            cell.style.color = 'yellow';
        } else if (grade >= 2.5 && grade <= 3.49) {
            cell.style.color = '#fcae05';
        } else if (grade >= 3.5 && grade <= 4.49) {
            cell.style.color = 'darkorange';
        } else if (grade >= 4.5 && grade <= 5.00) {
            cell.style.color = 'red';
        }
    }
}


function populateCombobox(tableTitles) {
    const dropdown = document.getElementById('tableTitlesDropdown');
    dropdown.innerHTML = '';

    let defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Vyberte předmět';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);

    // Add options for each table title
    tableTitles.forEach(title => {
        let option = document.createElement('option');
        option.value = title;
        option.text = title;
        dropdown.appendChild(option);
    });
}


function addGradeToTable(subject, grade, weight) {
    // Find the table with the matching subject
    const tables = document.querySelectorAll('.modern-table');
    let tableUpdated = false;
    let titleDivToUpdate;

    for (let table of tables) {
        const titleDiv = table.previousElementSibling;
        if (titleDiv && titleDiv.innerText === subject) {
            const newRow = table.insertRow(table.rows.length - 1);
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;

            newRow.insertCell(0).innerText = formattedDate;
            newRow.insertCell(1).innerText = grade;
            newRow.insertCell(2).innerText = 'PŘ';
            newRow.insertCell(3).innerText = weight;
            newRow.insertCell(4).innerText = 'Předvídačem přidaná známka';
            newRow.insertCell(5).innerText = '';

            // Create and append the remove and edit buttons to the new row
            let buttonCell = newRow.insertCell(6);
            let removeButton = createButton('Odstranit', () => removeGrade(newRow, subject), 'remove-grade-button');
            let editButton = createButton('Editovat', () => editGrade(newRow, 1, 3), 'edit-grade-button');
            buttonCell.appendChild(removeButton);
            buttonCell.appendChild(editButton);

            // Recalculate the weighted average including the new grade
            recalculateAverage(table, subject);

            tableUpdated = true;
            titleDivToUpdate = titleDiv;
            break;
        }
    }

    // Scroll to the updated table
    if (tableUpdated && titleDivToUpdate) {
        titleDivToUpdate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}


function resetTables() {
    if (originalTableData) {
        insertModernTables(originalTableData, document.querySelector('.classification-container'));

        // Reset and disable the input fields
        document.getElementById('známkaInput').value = '';
        document.getElementById('známkaInput').disabled = true;
        document.getElementById('váhaInput').value = '';
        document.getElementById('váhaInput').disabled = true;
    }
}

function removeLatestGradeFromTable(subject) {
    const tables = document.querySelectorAll('.modern-table');
    let gradeRemoved = false;
    let titleDivToUpdate;

    for (let table of tables) {
        const titleDiv = table.previousElementSibling;
        if (titleDiv && titleDiv.innerText === subject) {
            const lastRowIndex = table.rows.length - 2;
            if (lastRowIndex > 0) {
                const lastRow = table.rows[lastRowIndex];
                const isPredvidacAdded = lastRow.cells[4].innerText === 'Předvídačem přidaná známka';
                if (isPredvidacAdded) {
                    table.deleteRow(lastRowIndex);

                    // Recalculate the weighted average after removing the grade
                    const tableData = Array.from(table.rows).slice(1, -1).map(row => Array.from(row.cells).map(cell => cell.innerText));
                    const average = calculateWeightedAverage(tableData);
                    const averageCell = table.rows[table.rows.length - 1].cells[1];
                    averageCell.innerText = average.toFixed(2);
                    applyGradeColor(averageCell, averageCell.innerText);

                    gradeRemoved = true;
                    titleDivToUpdate = titleDiv;
                    break;
                }
            }
        }
    }

    // Scroll to the updated table
    if (gradeRemoved && titleDivToUpdate) {
        titleDivToUpdate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}




function recalculateAverage(table, subjectName) {
    // Extract table data excluding the last row (average)
    let tableData = Array.from(table.rows).slice(1, -1).map(row => Array.from(row.cells).map(cell => cell.innerText));

    // Check if there are any valid grades left for calculation
    let hasValidGrades = tableData.some(row => {
        let grade = parseGrade(row[1]);
        let weight = parseInt(row[3]);
        return !isNaN(grade) && !isNaN(weight) && weight > 0;
    });

    if (hasValidGrades) {
        // Recalculate the weighted average
        let average = calculateWeightedAverage(tableData);
        let averageCell = table.rows[table.rows.length - 1].cells[1];
        averageCell.innerText = average.toFixed(2);
        applyGradeColor(averageCell, averageCell.innerText);
        console.log(`[Kyberna MB] Recalculated average for ${subjectName}: ${average.toFixed(2)}`);
    } else {
        // Display "N/A" if there are no valid grades
        let averageCell = table.rows[table.rows.length - 1].cells[1];
        averageCell.innerText = 'N/A';
        averageCell.style.color = '';
        console.log(`[Kyberna MB] No valid grades left for ${subjectName}. Average set to N/A.`);
    }
}






function checkAndApplyThemeStyles() {
    chrome.storage.local.get("selectedTheme", function(result) {
        let theme = result.selectedTheme || 'theme1';

        let cssFileName;
        switch(theme) {
            case 'theme2':
                cssFileName = 'predvidacStyles2.css';
                break;
            case 'theme3':
                cssFileName = 'predvidacStyles3.css';
                break;
            default:
                cssFileName = 'predvidacStyles.css';
        }

        applyCssFile(cssFileName);
    });
}

function applyCssFile(fileName) {
    let link = document.createElement("link");
    link.href = chrome.runtime.getURL(fileName);
    link.type = "text/css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
}