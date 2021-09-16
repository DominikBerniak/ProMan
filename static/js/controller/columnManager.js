import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";
import {addNewCardHandler} from "./cardsManager.js";

export let columnManager = {
    loadColumns: async function (boardId) {
        const columns = await dataHandler.getColumnByBoardId(boardId);
        let columnCount = 0;
        for (let column of columns) {
            columnCount++;
            const columnBuilder = htmlFactory(htmlTemplates.column);
            const content = columnBuilder(column);
            domManager.addChild(`.board[data-board-id="${boardId}"]`, content);
        }
        handleColumns(columnCount);
        let boardTitle = document.querySelector(`.board-title[data-board-id="${boardId}"]`)
        let deleteBoardButton = document.createElement("div")
        deleteBoardButton.classList.add('delete-board')
        deleteBoardButton.innerHTML = `
                <form action="/api/boards/${boardId}/delete" method="post" >
                    <button type="submit" name="delete_board_button" id="delete_board_button">Delete board</button>
                </form>`
        boardTitle.after(deleteBoardButton)
        let addColumn = document.createElement("div")
        addColumn.classList.add("add-column-container")
        addColumn.innerHTML = `<button class="add_column_button">Add column</button>`
        deleteBoardButton.after(addColumn)
        addColumn.querySelector("button").addEventListener("click", e=>{
            addColumnHandler(boardId);
        })
        cardsManager.loadCards(boardId);
  },
    closeColumns: function (boardId){
        let columns = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`);
        columns.forEach(column =>{
          column.remove();
        })
        let deleteBoardButton = document.querySelector(`.board-container[data-board-id="${boardId}"] .delete-board`)
        deleteBoardButton.remove()
        let addColumnButton = document.querySelector(`.board-container[data-board-id="${boardId}"] .add-column-container`)
        addColumnButton.remove();
        const button = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
        button.innerHTML ="V";
  }
};

function handleColumns(columnCount){
    document.querySelectorAll(".column").forEach(async column=>{
        column.style.width = `${Math.floor(80 / columnCount)}%`;
        const columnHeader = column.querySelector(".column-header");
         let response = await fetch("/getUsername", {
            method: "GET",});
         if (response.status === 200) {
             columnHeader.addEventListener("click", e => {
                 editColumnTitle(e)
             })
         }
    })
}

export let editColumnTitle = function(e){
    let columnHeader = e.currentTarget;
    const oldTitle = columnHeader.innerHTML;
    if (columnHeader.childElementCount === 0){
        columnHeader.innerHTML = `<form>
            <input name="column-name" value="${oldTitle}">
        </form>`
        const form = columnHeader.querySelector("form");
        const input = columnHeader.querySelector("input");
        input.focus();
        let submitSuccess = false;
        input.addEventListener("focusout",e=>{
            if (!submitSuccess){
                columnHeader.innerHTML = oldTitle;
            }
        });
        form.addEventListener("submit",e=>{
            e.preventDefault();
            const boardId = columnHeader.closest(".board").dataset.boardId;
            if (!input.value){
                input.blur();
            }else if(checkIfColumnNameExist(input.value, boardId)){
                domManager.displayAlertModal("Alert", `Column ${input.value} already exists!`)
                input.blur();
            }else{
                submitSuccess = true;
                const column = columnHeader.closest(".column")
                const columnId = column.dataset.columnId;
                const cardsIds = [];
                column.querySelectorAll(".card").forEach(card=>{
                    cardsIds.push(card.dataset.cardId);
                })
                dataHandler.editColumn(input.value, columnId, boardId, cardsIds)
                    .then(response=>{
                        column.dataset.columnId = response["columnId"];
                        columnHeader.innerHTML = input.value;
                    })
            }
        })
    }
}

function checkIfColumnNameExist(columnName, boardId){
    const board = document.querySelector(`.board[data-board-id="${boardId}"]`);
    let columnNameExists = false;
    board.querySelectorAll(".column-header").forEach(columnHeader=>{
        if(columnHeader.innerHTML === columnName) {
            columnNameExists = true;
        }
    })
    return columnNameExists;
}

function addColumnHandler(boardId){
    document.querySelector("#boardModal #boardModalLabel").innerHTML = "New column";
    document.querySelector("#board_form .col-form-label").innerHTML = "Name your column:";
    $('#boardModal').modal();
    let form = document.getElementById('board_form');
    let input = document.getElementById("board-name");
    input.focus();
    form.addEventListener('submit', e=> {
        e.preventDefault();
        if (!input.value){
            $('#boardModal').modal('hide');
        }else{
            dataHandler.addColumn(input.value, boardId)
                .then(async response => {
                    const columnId = response["columnId"];
                    const column = {
                        id: columnId,
                        name: input.value
                    };
                    const columnBuilder = htmlFactory(2);
                    const content = columnBuilder(column);
                    domManager.addChild(`.board[data-board-id="${boardId}"]`, content);
                    let columnElem = document.querySelector(`.board[data-board-id="${boardId}"] .column[data-column-id="${columnId}"]`);
                    columnElem.removeAttribute("hidden");
                    const newCardButton = document.createElement("button");
                    newCardButton.innerHTML = "New Card";

                    let response2 = await fetch("/getUsername", {
                        method: "GET",
                    });
                    if (response2.status === 200) {
                        newCardButton.classList.add("new-card-button", "btn");
                    }
                    else {
                        newCardButton.classList.add("new-card-button", "btn", "hidden");
                    }
                    columnElem.appendChild(newCardButton);
                    newCardButton.addEventListener("click", e => {
                        addNewCardHandler(e, boardId, columnId)
                    })
                    let columnCount = 0;
                    for (let column of document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`)) {
                        columnCount++;
                    }
                    handleColumns(columnCount);
                })
            $('#boardModal').modal('hide');
        }
    });
}