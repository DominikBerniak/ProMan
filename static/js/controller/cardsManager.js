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
      domManager.addEventListener(
        `.card[data-card-id="${card.id}"]`,
        "click",
        cardEditDeleteHandler
      );
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
        input.focus();
        input.addEventListener("focusout", e=>{
            button.innerHTML = "New Card";
        });
        form.addEventListener("submit",e=>{
            e.preventDefault();
            if (!input.value){
                input.blur();
                return;
            }
            dataHandler.createNewCard(input.value,boardId, columnId)
                .then(()=>{
                    const newCard = document.createElement("div");
                    newCard.classList.add("card");
                    newCard.innerHTML = `${input.value}`
                    button.before(newCard);
                    button.innerHTML = "New Card";
                });
        })
    }
}
function cardEditDeleteHandler(){
    if (this.childElementCount ===0){
        let oldCardMessage = this.innerHTML;
        const card = this;
        const cardId = card.dataset.cardId;
        card.innerHTML = `<div class="card-edit-box">
                <form method="post">
                    <input name="card-title" value="${oldCardMessage}">
                </form>
                <button class="delete-card">X</button>
                </div>`
        const form = this.querySelector("form");
        const input = this.querySelector("input");
        const deleteCardButton = this.querySelector(".delete-card")
        input.focus();
        deleteCardButton.addEventListener("click",e=>{
            dataHandler.deleteCard(cardId)
                .then(()=>{
                    this.remove();
                })
        });
        const board = this.closest(".board");
        let unfocused = false;
        form.addEventListener("submit",e=>{
            unfocused = true;
            e.preventDefault();
            if(!input.value){
                card.innerHTML = oldCardMessage;
                return;
            }
            dataHandler.editCard(cardId,input.value)
                .then(()=>{
                    this.innerHTML = input.value;
                })
        })
        board.addEventListener("click",e=>{
            if (input !== document.activeElement && deleteCardButton !== document.activeElement && !unfocused){
                card.innerHTML = oldCardMessage;
                unfocused = true;
            }
        })
    }
}
