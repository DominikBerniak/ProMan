import { boardsManager } from "./controller/boardsManager.js";
import { userManager } from "./controller/userManager.js";
import { navbarManager } from "./controller/navbarManager.js";


async function init() {
  userManager.checkLoginStatus()

  navbarManager.generateNavbar()
  boardsManager.loadBoards();
  boardsManager.addNewBoard();
  userManager.registerUser();
  userManager.loginUser()
  userManager.logoutUser()
}


window.onload = function (){


  init();
}
