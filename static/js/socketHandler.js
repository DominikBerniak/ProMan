import {boardsManager} from "./controller/boardsManager.js";
export let socket = {
    connection : io()
}
socket.connection.on("new board response", board => {
    boardsManager.addBoardToDom(board);
});

socket.connection.on("edit board response", board => {
    document.querySelector(`.board-title[data-board-id="${board.id}"]`).innerHTML = board.title
});

socket.connection.on("delete board response", boardId => {
    document.querySelector(`#root .board-container[data-board-id="${boardId}"]`).remove();
});