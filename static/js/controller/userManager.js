import { domManager } from "../view/domManager.js";
import { dataHandler } from "../data/dataHandler.js";
import { boardsManager } from "./boardsManager.js";



export let userManager = {
  registerUser: function () {
    domManager.addEventListener('#registerModal',
        'show.bs.modal',
        showModal)
    let form = document.getElementById('register_form')
    form.addEventListener('submit', function (e) {
      shootRequest(e)
      $('#registerModal').modal('hide');
    })
  }
}
function showModal(event) {
    let modal = this
    modal.find('.modal-title').text('New board')
}


async function shootRequest(e) {
  e.preventDefault()
  const form = e.currentTarget
  const url = form.action;
  try {
    const formData = new FormData(form);
    let response = await apiPost(url, formData)
      switch (response.status){
          case 200:
              document.getElementById("root").innerHTML = ""
              boardsManager.loadBoards()
              break
          case 401:
              alert("wrongData")
              break

      }

  } catch (error) {
    console.log(error);
  }
}



async function apiPost(url, formData) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);
  const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: formDataJsonString,
        });
    return response
}