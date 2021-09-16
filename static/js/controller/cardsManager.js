import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import {columnManager} from "./columnManager.js";

export let cardsManager = {
  loadCards: async function (boardId) {
    const cards = await dataHandler.getCardsByBoardId(boardId);
    const toggleButton = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
    toggleButton.classList.remove("bi-caret-down-square");
    toggleButton.classList.add("bi-caret-up-square");
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
    for (const column of document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`)) {
        const newCardButton = document.createElement("button");
        newCardButton.innerHTML = "New card";

        let response = await fetch("/getUsername", {
            method: "GET",
        });
        if (response.status === 200) {
            newCardButton.classList.add("new-card-button", "btn", "btn-default", "mx-auto");
        }
        else {
            newCardButton.classList.add("new-card-button", "btn", "btn-default", "mx-auto", "hidden");
        }
        column.appendChild(newCardButton);
        const columnId = column.dataset.columnId;
        newCardButton.addEventListener("click",e=>{
            addNewCardHandler(e, boardId, columnId);
        })
        column.removeAttribute("hidden");
    }
  },
};

export let addNewCardHandler = function(e, boardId, columnId){
    if (e.currentTarget.childElementCount ===0){
        const button = e.currentTarget;
        button.classList.remove("new-card-button", "btn", "btn-default")
        button.classList.add("clear-button")
        button.innerHTML = `
        <form class="new-card-form" method="post">
            <input name="card-title" class="rounded">
        </form>`
        const form = e.currentTarget.querySelector("form");
        const input = e.currentTarget.querySelector("input");
        input.focus();
        input.addEventListener("focusout", e=>{
            button.innerHTML = "New card";
            button.classList.remove("clear-button");
            button.classList.add("new-card-button", "btn", "btn-default");
        });
        form.addEventListener("submit",e=>{
            e.preventDefault();
            if (!input.value){
                input.blur();
                return;
            }
            dataHandler.createNewCard(input.value,boardId, columnId)
                .then(response=>{
                    const newCard = document.createElement("div");
                    newCard.classList.add("card", "p-2", "mt-1", "mb-1");
                    let dataAttribute = document.createAttribute("data-card-id");
                    dataAttribute.value = response["cardId"];
                    newCard.setAttributeNode(dataAttribute);
                    newCard.innerHTML = `${input.value}`
                    button.before(newCard);
                    button.innerHTML = "New card";
                    button.classList.remove("clear-button");
                    button.classList.add("new-card-button", "btn", "btn-default");
                });
        })
    }
}
function cardEditDeleteHandler(){
    if (this.childElementCount ===0){
        let oldCardMessage = this.innerHTML;
        const card = this;
        const cardId = card.dataset.cardId;
        card.innerHTML = `<div class="d-flex">
                <form method="post">
                    <input name="card-title" class="rounded" value="${oldCardMessage}">
                </form>
                <button class="delete-card bi bi-x-square delete-icon-button clear-button"></button>
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
        document.addEventListener("click",e=>{
            if (input !== document.activeElement && deleteCardButton !== document.activeElement && !unfocused){
                card.innerHTML = oldCardMessage;
                unfocused = true;
            }
        })
    }
}
