import { boardsManager } from "./controller/boardsManager.js";

function init() {
  boardsManager.loadBoards();
  boardsManager.addNewBoard();
}

init();
