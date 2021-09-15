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
        cardsManager.loadCards(boardId);
  },
    closeColumns: function (boardId){
        let columns = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`);
        columns.forEach(column =>{
          column.remove();
        })
        const button = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
        button.innerHTML ="V";
  }
};