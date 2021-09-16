export let navbarManager = {
  generateNavbar: async function () {
        let response = await fetch("/getUsername", {
            method: "GET",
        });
      switch (response.status){
          case 200:
              response.json().then(data => {
                  const content = buildNavUser(data["username"])
                  document.getElementById("login-status").innerHTML = content
                  document.getElementById("logout").className = "btn btn-default"
              });
              break
          case 203:
              const content = buildNavGuest();
              document.getElementById("login-status").innerHTML = content
              document.getElementById("logout").className = "hidden"
              break
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

