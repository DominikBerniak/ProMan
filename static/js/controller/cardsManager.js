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
      domManager.addChild(`.board[data-board-id="${boardId}"]`, content);
      domManager.addEventListener(
        `.card[data-card-id="${card.id}"]`,
        "click",
        deleteButtonHandler
      );
    }
  },
  closeCards: function (boardId){
    let cards = document.querySelectorAll(`.board[data-board-id="${boardId}"] .card`);
    cards.forEach(card =>{
      card.remove();
    })
    const button = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
    button.innerHTML ="V";
  }
};

function deleteButtonHandler(clickEvent) {}
