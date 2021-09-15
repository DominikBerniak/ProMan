import { boardsManager } from "./controller/boardsManager.js";
import { userManager } from "./controller/userManager.js";
import { navbarManager } from "./controller/navbarManager.js";


function init() {
  navbarManager.generateNavbar()
  boardsManager.loadBoards();
  boardsManager.addNewBoard();
  userManager.registerUser();
  userManager.loginUser()
  userManager.logoutUser()
}



init();
