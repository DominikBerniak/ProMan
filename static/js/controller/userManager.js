import { domManager } from "../view/domManager.js";
import { dataHandler } from "../data/dataHandler.js";



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
  console.log(form)
  console.log(url)
  try {
    const formData = new FormData(form);
    await apiPost(url, formData)
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
    return response.text()
}