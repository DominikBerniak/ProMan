import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
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
        showHideButtonHandler
      );
    }
  },
  addNewBoard: async function () {
    domManager.addEventListener('#boardModal',
        'show.bs.modal',
        showModal)
    let form = document.getElementById('board_form')
    form.addEventListener('submit', function (e) {
      dataHandler.createNewBoard(e)
      $('#boardModal').modal('hide');
    })
}}

function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  const board = document.querySelector(`.board[data-board-id="${boardId}"]`);
  const boards = document.querySelectorAll('.')
  if (board.childElementCount === 0){
    cardsManager.loadCards(boardId);
  }else{
    cardsManager.closeCards(boardId);
  }}


function showModal(event) {
    let modal = this
    modal.find('.modal-title').text('New board')
}
