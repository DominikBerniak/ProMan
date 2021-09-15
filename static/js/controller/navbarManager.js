export let navbarManager = {
  generateNavbar: async function () {
        let response = await fetch("/getUsername", {
            method: "GET",
        });
      console.log(response.status)
      switch (response.status){
          case 200:
              response.json().then(data => {
                  const content = buildNavUser(data["username"])
                  document.getElementById("right-site").innerHTML = content
              });
              break
          case 404:
              const content = buildNavGuest();
              document.getElementById("right-site").innerHTML = content
              break
      }

    }
}





function buildNavGuest(){
    return "        <div id=\"right-site\">\n" +
        "          <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarNavAltMarkup\" aria-controls=\"navbarNavAltMarkup\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n" +
        "            <span class=\"navbar-toggler-icon\"></span>\n" +
        "          </button>\n" +
        "          <div class=\"collapse navbar-collapse\" id=\"navbarNavAltMarkup\">\n" +
        "              <div id=\"username\">currently as QUEST</div>\n" +
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
        "              <a class=\"nav-item nav-link\" href=\"/logout\">Log Out</a>\n" +
        "            </div>\n" +
        "            </div>\n"
}

