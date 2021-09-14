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
                  document.getElementById("navigation").innerHTML = content
              });
              break
          case 404:
              const content = buildNavQuest();
              document.getElementById("navigation").innerHTML = content
              break
      }

    }
}





function buildNavQuest(){
    return "<nav class=\"navbar navbar-expand-lg navbar-light bg-light\" id=\"nav\">\n" +
        "        <div class=\"left-site\">\n" +
        "            <a class=\"navbar-brand\" href=\"/\">ProMan</a>\n" +
        "            <button type=\"button\" class=\"btn btn-default\" data-toggle=\"modal\" data-target=\"#boardModal\">Add new board</button>\n" +
        "        </div>\n" +
        "        <div id=\"right-site\">\n" +
        "          <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarNavAltMarkup\" aria-controls=\"navbarNavAltMarkup\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n" +
        "            <span class=\"navbar-toggler-icon\"></span>\n" +
        "          </button>\n" +
        "          <div class=\"collapse navbar-collapse\" id=\"navbarNavAltMarkup\">\n" +
        "              <div id=\"username\">currently as QUEST</div>\n" +
        "            <div class=\"navbar-nav\">\n" +
        "              <a class=\"nav-item nav-link\" href=\"\" data-toggle=\"modal\" data-target=\"#registerModal\">Sign Up</a>\n" +
        "              <a class=\"nav-item nav-link\" href=\"\" data-toggle=\"modal\" data-target=\"#loginModal\">Log in</a>\n" +
        "            </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </nav>"
}


function buildNavUser(username){
    return "\n" +
        "    <nav class=\"navbar navbar-expand-lg navbar-light bg-light\" id=\"nav\">\n" +
        "        <div class=\"left-site\">\n" +
        "            <a class=\"navbar-brand\" href=\"/\">ProMan</a>\n" +
        "            <button type=\"button\" class=\"btn btn-default\" data-toggle=\"modal\" data-target=\"#boardModal\">Add new board</button>\n" +
        "        </div>\n" +
        "        <div id=\"right-site\">\n" +
        "          <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarNavAltMarkup\" aria-controls=\"navbarNavAltMarkup\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\n" +
        "            <span class=\"navbar-toggler-icon\"></span>\n" +
        "          </button>\n" +
        "          <div class=\"collapse navbar-collapse\" id=\"navbarNavAltMarkup\">\n" +
        `              <div id="username">logged in as ${username}</div>\n` +
        "            <div class=\"navbar-nav\">\n" +
        "              <a class=\"nav-item nav-link\" href=\"/logout\">Log Out</a>\n" +
        "            </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </nav>"
}



async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.status === 200) {
    let data = response.json();
    return data;
  }
  if (response.status === 404) {
    let data = response.json();
    return data;
  }
}