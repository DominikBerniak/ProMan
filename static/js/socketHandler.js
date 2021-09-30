import {boardsManager} from "./controller/boardsManager.js";
import {addColumnToDom, addNewCardButton, handleColumns} from "./controller/columnManager.js";
import {addNewCardToDom, cardEditDeleteHandler, handleDraggableCards} from "./controller/cardsManager.js";

export let socket = {
    connection : io()
}
socket.connection.on("new board response", board => {
    boardsManager.addBoardToDom(board);
});

socket.connection.on("edit board response", board => {
    document.querySelector(`.board-title[data-board-id="${board.id}"]`).innerHTML = board.title;
});

socket.connection.on("delete board response", boardId => {
    document.querySelector(`#root .board-container[data-board-id="${boardId}"]`).remove();
});
socket.connection.on("new column response", data =>{
    let columnId = data.columnId;
    let columnName = data.name;
    let boardId = data.boardId;
    addColumnToDom({id: columnId, name: columnName}, boardId);
    addNewCardButton(boardId, columnId);
    let columnCount = 0;
    for (let column of document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`)) {
        columnCount++;
    }
    handleColumns(columnCount);
})
socket.connection.on("delete column response", data=>{
    let boardId = data.boardId;
    let columnId = data.columnId;
    document.querySelector(`.board[data-board-id="${boardId}"] .column[data-column-id="${columnId}"]`).remove();
    const columnNum = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`).length;
    handleColumns(columnNum);
})
socket.connection.on("edit column response", data=>{
    let boardId = data.boardId;
    let columnId = data.columnId;
    let column = document.querySelector(`.board[data-board-id="${boardId}"] .column[data-column-id="${columnId}"]`);
    column.dataset.columnId = data.newId;
    column.querySelector(".column-header").innerHTML = data.name;
})
socket.connection.on("new card response", data=>{
    let boardId = data.boardId;
    let columnId = data.columnId;
    let cardId = data.cardId;
    let cardName = data.name;
    let newCard = addNewCardToDom(boardId, columnId, cardId, cardName);
    newCard.addEventListener("click", cardEditDeleteHandler)
    handleDraggableCards();
})
socket.connection.on("delete card response", cardId=>{
    document.querySelector(`.card[data-card-id="${cardId}"]`).remove();
})
socket.connection.on("edit card response", data=>{
    document.querySelector(`.card[data-card-id="${data.cardId}"]`).innerHTML = data.name;
})