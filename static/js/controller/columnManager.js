import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

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
        document.querySelectorAll(".column").forEach(column=>{
            column.style.width = `${Math.floor(80 / columnCount)}%`;
            const columnHeader = column.querySelector(".column-header");
            columnHeader.addEventListener("click",e=>{
                editColumnTitle(e)
            })
        })
        let boardTitle = document.querySelector(`.board-title[data-board-id="${boardId}"]`)
        let deleteButton = document.createElement("div")
        deleteButton.classList.add('delete-board')
        deleteButton.innerHTML = `
                <form action="/api/boards/${boardId}/delete" method="post" >
                    <button type="submit" name="delete_board_button" id="delete_board_button">Delete board</button>
                </form>`
        boardTitle.after(deleteButton)
        cardsManager.loadCards(boardId);
  },
    closeColumns: function (boardId){
        let columns = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`);
        columns.forEach(column =>{
          column.remove();
        })
        let deleteButton = document.querySelector('.delete-board')
        deleteButton.remove()
        const button = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
        button.innerHTML ="V";
  }
};
function editColumnTitle(e){
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
