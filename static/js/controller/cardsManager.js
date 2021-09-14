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
        const newCardButton = document.createElement("button");
        newCardButton.innerHTML = "New Card";
        newCardButton.classList.add("new-card-button", "btn");
        column.appendChild(newCardButton);
        const columnId = column.dataset.columnId;
        newCardButton.addEventListener("click",e=>{
            addNewCardHandler(e, boardId, columnId);
        })
        column.removeAttribute("hidden");
    })
  },
};

function addNewCardHandler(e, boardId, columnId){
    if (e.currentTarget.childElementCount ===0){
        const button = e.currentTarget;
        button.innerHTML = `
        <form class="new-card-form" method="post">
            <input name="card-title">
        </form>`
        const form = e.currentTarget.querySelector("form");
        const input = e.currentTarget.querySelector("input");
        form.addEventListener("submit",e=>{
            e.preventDefault();
            dataHandler.createNewCard(input.value,boardId, columnId)
                .then(()=>{
                    const newCard = document.createElement("div");
                    newCard.classList.add("card");
                    newCard.innerHTML = `${input.value}`
                    button.before(newCard);
                    form.remove();
                    button.innerHTML = "New Card";
                });
        })
    }
}
