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
                    <button type="submit" name="delete_board_button" id="delete_board_button" class="btn">Delete board</button>
                </form>`
        boardTitle.after(deleteBoardButton)
        let addColumn = document.createElement("div")
        addColumn.classList.add("add-column-container")
        addColumn.innerHTML = `<button class="add_column_button btn header-button">Add column</button>`
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
        button.classList.remove("bi-caret-up-square")
        button.classList.add("bi-caret-down-square")
  }
};

function handleColumns(columnCount){
    document.querySelectorAll(".column").forEach(column=>{
        column.style.width = `${Math.floor(90 / columnCount)}%`;
        const columnHeader = column.querySelector(".column-header");
        columnHeader.addEventListener("click",e=>{
            columnTitleEditDeleteHandler(e)
        })
    })
}

function columnTitleEditDeleteHandler(e){
    let columnHeader = e.currentTarget;
    const oldTitle = columnHeader.innerHTML;
    if (columnHeader.childElementCount === 0){
        columnHeader.innerHTML = `<div class="d-flex">
            <form><input name="column-name" class="rounded" value="${oldTitle}"></form>
            <button class="delete-column bi bi-x-square delete-icon-button clear-button"></button>
            </div>`
        const form = columnHeader.querySelector("form");
        const input = columnHeader.querySelector("input");
        const deleteColumnButton = columnHeader.querySelector(".delete-column");
        input.focus();
        deleteColumnButton.addEventListener("click",e=>{
            const column = columnHeader.closest(".column");
            const columnId = column.dataset.columnId;
            const boardId = column.closest(".board").dataset.boardId;
            dataHandler.deleteColumn(boardId, columnId)
                .then(()=>{
                    column.remove();
                })
        });
        let submitSuccess = false;
        form.addEventListener("submit",e=>{
            e.preventDefault();
            const boardId = columnHeader.closest(".board").dataset.boardId;
            if (!input.value){
                restoreColumnTitle(columnHeader,oldTitle);
            }else if(checkIfColumnNameExist(input.value, boardId)){
                alert(`Column ${input.value} already exists!`)
                restoreColumnTitle(columnHeader,oldTitle);
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
        document.addEventListener("click",e=>{
            if (input !== document.activeElement && deleteColumnButton !== document.activeElement && !submitSuccess){
                restoreColumnTitle(columnHeader,oldTitle);
                submitSuccess = true;
            }
        })
    }
}
function restoreColumnTitle(columnHeader, title){
    columnHeader.innerHTML = title;
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
    let modalTitle = document.querySelector("#boardModal #boardModalLabel");
    let modalLabel = document.querySelector("#board_form .col-form-label");
    modalTitle.innerHTML = "New column";
    modalLabel.innerHTML = "Name your column:";
    $('#boardModal').modal();
    let form = document.getElementById('board_form');
    let input = document.getElementById("board-name");
    input.value = "";
    input.focus();
    form.addEventListener('submit', e=> {
        e.preventDefault();
        if (!input.value){
            $('#boardModal').modal('hide');
        }else{
            dataHandler.addColumn(input.value, boardId)
                .then(response=>{
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
                    newCardButton.innerHTML = "New card";
                    newCardButton.classList.add("new-card-button", "btn", "btn-default", "mx-auto");
                    columnElem.appendChild(newCardButton);
                    newCardButton.addEventListener("click",e=>{
                        addNewCardHandler(e, boardId, columnId)
                    })
                    let columnCount = 0;
                    for (let column of document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`)){
                        columnCount++;
                    }
                    handleColumns(columnCount);
                })
            $('#boardModal').modal('hide');
        }
    });
}