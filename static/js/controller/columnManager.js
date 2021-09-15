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