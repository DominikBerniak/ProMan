import {userManager} from "./userManager.js";

export let navbarManager = {
  generateNavbar: async function () {
      await userManager.checkLoginStatus()
      if (localStorage.getItem("username") !== null){
          let content = buildNavUser(localStorage.getItem("username"))
          document.getElementById("login-status").innerHTML = content
          document.getElementById("logout").className = "";
          document.getElementById("add-new-board-button").className = "btn btn-default"
      }
      else {
          const content = buildNavGuest();
          document.getElementById("login-status").innerHTML = content
          document.getElementById("logout").className = "hidden"
          document.getElementById("add-new-board-button").className = "hidden"
      }
    }

}





function buildNavGuest(){
    return "\n" +
        "          <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarNavAltMarkup\" aria-controls=\"navbarNavAltMarkup\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n" +
        "            <span class=\"navbar-toggler-icon\"></span>\n" +
        "          </button>\n" +
        "          <div class=\"collapse navbar-collapse\" id=\"navbarNavAltMarkup\">\n" +
        "              <div id=\"username\">currently as GUEST</div>\n" +
        "            <div class=\"navbar-nav\">\n" +
        "              <a class=\"nav-item nav-link\" href=\"\" data-toggle=\"modal\" data-target=\"#registerModal\">Sign Up</a>\n" +
        "              <a class=\"nav-item nav-link\" href=\"\" data-toggle=\"modal\" data-target=\"#loginModal\">Log in</a>\n" +
        "            </div>\n" +
        "            </div>\n"
}


function buildNavUser(username){
    return "\n" +
        "          <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarNavAltMarkup\" aria-controls=\"navbarNavAltMarkup\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n" +
        "            <span class=\"navbar-toggler-icon\"></span>\n" +
        "          </button>\n" +
        "          <div class=\"collapse navbar-collapse\" id=\"navbarNavAltMarkup\">\n" +
        `              <div id="username">logged in as ${username}</div>\n` +
        "            <div class=\"navbar-nav\">\n" +
        "            </div>\n" +
        "            </div>\n"
}

