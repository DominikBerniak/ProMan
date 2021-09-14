import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";

export let cardsManager = {
  loadCards: async function (boardId) {
    const cards = await dataHandler.getCardsByBoardId(boardId);
    document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`).innerHTML ="A";
    for (let card of cards) {
      const cardBuilder = htmlFactory(htmlTemplates.card);
      const content = cardBuilder(card);
      domManager.addChild(`.board[data-board-id="${boardId}"] .column[data-column-id="${card.column_id}"]`, content);
      // domManager.addEventListener(
      //   `.card[data-card-id="${card.id}"]`,
      //   "click",
      //   deleteButtonHandler
      // );
    }
    document.querySelectorAll(`.board[data-board-id=\"${boardId}\"] .column`).forEach(column=>{
      column.removeAttribute("hidden");
    })
  },
};

function deleteButtonHandler(clickEvent) {}
