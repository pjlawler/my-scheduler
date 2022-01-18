const startDay = 8;
const endDay = 17;
let todoItems = [];
let lastDate = null;

function createTimeBlocks() {

    // Creates the daily schedule layout based on the start and end of day times

    // Gets any events currently stored in the browser
    loadLocalStorage();

    // Gets the schedule's container to append the generated elements after they are created for each hour
    const hourEl = $(".container");
    
    // Creates the row for each hour of the day
    for (let i = startDay; i < endDay + 1; i++) {
        
        // Converts the hour number into the 12-hour format
        const rowHour = i < 13 ? i : i - 12;
        
        // Creates the row element that will hold the 3 columns (time, descrtiption and button)
        const hourRow = $("<div>")
            .attr("id","hourRow-" + i)
            .addClass("row align-items-start scheduleRow");
        
        // Creates the row's columns for time, description and save button
        
        // time
        const hourBlock = $("<div>")
            .addClass("col-1 hour")
            .text(i < 12 ? rowHour + "AM" : rowHour + "PM");
        
        const descriptionBlock = $("<span>")
            .append($("<p>").text(getDescriptionTex(i)));
        
        // icon in the button to be appended in the button
        const buttonIcon = $("<div>")
            .addClass("material-icons icon")
            .text("save");
       
        // button
        const saveButton = $("<button>")
            .addClass("col-1 saveBtn")
            .append(buttonIcon);
    
        // Appends the columns into the row
        hourRow.append(hourBlock, descriptionBlock, saveButton);

        // Appends the row into the container
        hourEl.append(hourRow);
    }

    // Sets the background color to each description based on time of day
    auditDayStatus();
}

function auditDayStatus() {

    // Resets the jumbotron and reloads the todo items if it's a new day
    const currentDate = moment().format("l");
    if (!lastDate && lastDate !== currentDate) {
        setCurentDay();
        loadLocalStorage();
    }
    
    // Stores the current date as the last date for something to compare to the next time the method executes
    lastDate = currentDate;
    
    // Sets the background color to each description block based on the time of day
    for (let i = startDay; i < endDay + 1; i++) {
        $("#hourRow-" + i).children("span")
            .removeClass()
            .addClass("col " + statusClass(i));
    }
    
    function statusClass(blockNumber) {

        // Returns the class for the description block depending on the status of the block's time comapred to the current time 
    
        // Gets the current time as a single hour
        const currentHour = moment().format("H");
         
        // Compares the block to current hour and returns the respective color
        if (blockNumber < currentHour) {
            return "description past";
        }
        else if (blockNumber == currentHour) {
            return "description present";
        }
        else {
            return "description future";
        }
    }
}

function getDescriptionTex(hour) {
    // Returns the description text if anything is local storage for that hour
    for(let i = 0; i < todoItems.length; i++) {
        if (todoItems[i]['timeSlot'] == hour) {
            return todoItems[i]['description'];
        }
    }
    return "";
}

function loadLocalStorage() {

    // Gets the data, if any, from local storage and puts it into the todoItems array
    if (window.localStorage.getItem("todos")) {
        todoItems = JSON.parse(window.localStorage.getItem("todos"));

        // Clears out the local storage and the array if the items are not from today
        if(todoItems.length > 0 && todoItems[0]['date'] !== moment().format('l')) {
            window.localStorage.clear;
            todoItems = [];
        }
    }
    else {
        // Sets todo items to an empty array if there's nothing in localStorage
        todoItems = [];
    }
}

function updateToDos(index, todoItem) {

    // Adds to or updates the todoItems array; then stores the array in local storage

    // Creates the todo object
    const todo = {
        date: moment().format("l"),
        timeSlot: index,
        description: todoItem
    }

    // Searches to see if that timeslot's object is currently in storage and if it is, it updates it
    if (todoItems) {
        for (let i = 0; i < todoItems.length; i++) {
            if (todoItems[i]['timeSlot'] == index) {
                todoItems[i] = todo;
                // Nullifies the variable to indicate that the item was updated
                todoItem = null;
            }
        }
    }

    // If there's nothing in localStorage for that timeslot or it is new, then it pushes the object into the array as a new element
    if (todoItem) {
        todoItems.push(todo);
    }

    window.localStorage.setItem("todos", JSON.stringify(todoItems));
}

function setCurentDay() {
    // sets the current date for display in the jumbotron 
    $("#currentDay").text(moment().format("dddd, MMMM Do"));
}

$(".container").on("click", "button", function() {

    // Gets the textarea from the button's respective row
    const description = $(this)
    .closest("div")
    .children("span")
    .children("textarea");


    // Checks to see if the textarea exists, if not, the method will not execute
    if (description.length !== 1) {
        return false;
    }

    // Gets the text from the editing textarea
    const text = $(description).val();
    
    // Gets the time block of the row that's being edited
    const index = $(this)
        .closest("div")
        .attr("id")
        .replace("hourRow-", "")
    
    // Updates the array and localStorage with the new text
    updateToDos(index, text);

    // Recreate p element for description block
    const taskP = $("<p>")
        .text(text);
    
    // replace textarea with new p element and text
    $(this)
        .closest("div")
        .children("span")
        .children("textarea")
        .replaceWith(taskP);

    // Updates the day and colors
    auditDayStatus();

    // Unfocuses the button to look normal
    $(this).blur();
})

// Editable field in the description was clicked
$(".container").on("click", "p", function() {
    // get current text of p element
    var text = $(this)
    .text()
    .trim();

    // replaces p element with, and transfers text to, a text input field
    var textInput = $("<textarea>").addClass("form-control").val(text);
    $(this).replaceWith(textInput);

    // auto focus text input field
    textInput.trigger("focus");
})

// Runs the auditDayStatus function every 5 seconds
setInterval(function(){
   auditDayStatus();
}, 5000);

createTimeBlocks();
