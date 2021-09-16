import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { columnManager} from "./columnManager.js";
import { cardsManager } from "./cardsManager.js";

export let boardsManager = {

  loadBoards: async function () {
    const boards = await dataHandler.getBoards();
    for (let board of boards) {
        const boardBuilder = htmlFactory(htmlTemplates.board);
        const content = boardBuilder(board);
        domManager.addChild("#root", content);
        domManager.addEventListener(
        `.toggle-board-button[data-board-id="${board.id}"]`,
        "click",
        showHideButtonHandler);
        let response = await fetch("/getUsername", {
            method: "GET",
        });
        if (response.status === 200) {
            domManager.addEventListener(`.board-title[data-board-id="${board.id}"]`,
              "click",
              changeTitleHandler);
        }
    }
  },

    addNewBoard: async function () {
      const newBoardButton = document.getElementById("add-new-board-button");
      newBoardButton.addEventListener("click", ()=>{
        let modalTitle = document.querySelector("#boardModal #boardModalLabel");
        modalTitle.innerHTML = "New board";
        let modalLabel = document.querySelector("#board_form .col-form-label");
        modalLabel.innerHTML = "Name your board:";
        $('#boardModal').modal();
        let form = document.getElementById('board_form')
        form.addEventListener('submit', function (e) {
          if (modalTitle.innerHTML === "New board"){
            dataHandler.createNewBoard(e)
            $('#boardModal').modal('hide');
          }
      })
      })
    }
};

function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  const board = document.querySelector(`.board[data-board-id="${boardId}"]`);
  if (board.childElementCount === 0){
    columnManager.loadColumns(boardId)
  }else{
    columnManager.closeColumns(boardId);
  }
}

function showModal(event) {
    let modal = this
    modal.find('.modal-title').text('New board')
}

export let changeTitleHandler = function (e){
  let boardId = e.currentTarget.dataset.boardId;
  if (e.currentTarget.childElementCount ===0){
    let oldBoardTitle = e.currentTarget.innerHTML;
    let boardTitle = e.currentTarget;
    boardTitle.innerHTML = `
    <form class="board-title-form" action="/api/boards/${boardId}/rename/" method="post">
        <input class="rounded" name="title" value="${oldBoardTitle}">
    </form>`
    const form = boardTitle.querySelector("form");
    let input = boardTitle.querySelector("input");
    input.focus();
    input.addEventListener("focusout", e=>{
      boardTitle.innerHTML = oldBoardTitle;
    });
    form.addEventListener("submit", e=>{
      e.preventDefault();
      if (!input.value){
        input.blur();
      }else{
        dataHandler.renameBoard(e)
            .then(()=>{
              boardTitle.innerHTML = input.value;
            });
      }
    });
  }
}


