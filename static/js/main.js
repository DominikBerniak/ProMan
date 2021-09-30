import {boardsManager} from "./controller/boardsManager.js";
import {userManager} from "./controller/userManager.js";
import {navbarManager} from "./controller/navbarManager.js";


async function init() {
  navbarManager.generateNavbar()
  boardsManager.loadBoards();
  boardsManager.addNewBoard();
  userManager.registerUser();
  userManager.loginUser()
  userManager.logoutUser()
  boardsManager.initRefreshPageButton()
  boardsManager.initArchivePageButton()
}

window.addEventListener('load', () => {
    init();
});