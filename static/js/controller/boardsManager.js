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
      domManager.addEventListener(`.board-title[data-board-id="${board.id}"]`,
          "click",
          changeTitleHandler);
    }
  },
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
function changeTitleHandler(e){
  let boardId = parseInt(e.currentTarget.dataset.boardId)
  if (e.currentTarget.childElementCount ===0){
    let oldBoardTitle = e.currentTarget.innerHTML;
    let boardTitle = e.currentTarget;
    boardTitle.innerHTML = `
    <form class="board-title-form" action="/api/boards/${boardId}/rename/" method="post">
        <input name="title">
    </form>`
    let input = document.querySelector(".board-title-form input");
    input.focus();
    input.addEventListener("focusout", e=>{
      boardTitle.innerHTML = oldBoardTitle;
    });
    document.querySelector(".board-title-form").addEventListener("submit", e=>{
      e.preventDefault();
      if (!input.value){
        boardTitle.innerHTML = oldBoardTitle;
      }
    })
  }
}
