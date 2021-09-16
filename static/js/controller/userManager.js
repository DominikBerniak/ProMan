import { domManager } from "../view/domManager.js";
import { navbarManager } from "./navbarManager.js";
import { boardsManager } from "./boardsManager.js";
import { dataHandler } from "../data/dataHandler.js";
import { changeTitleHandler } from "./boardsManager.js";
import { editColumnTitle } from "./columnManager.js";


export let userManager = {
  registerUser: function () {
    let form = document.getElementById('register_form')
    form.addEventListener('submit', function (e) {
      handleRegistration(e)
      $('#registerModal').modal('hide');
    })
  },
    loginUser: function () {
    let form = document.getElementById('login_form')
    form.addEventListener('submit', function (e) {
      handleLogin(e)
      $('#loginModal').modal('hide');
    })
    },
    logoutUser: function () {
    let form = document.getElementById('logout')
    form.addEventListener('submit', function (e) {
      handleLogout(e)
    })
    }
}
function showModal(event) {
    let modal = this
    modal.find('.modal-title').text('New board')
}


async function handleRegistration(e) {
  e.preventDefault()
  const form = e.currentTarget
  const url = form.action;
  try {
    const formData = new FormData(form);
    let response = await apiPost(url, formData)
      switch (response.status){
          case 200:
              alert("registration successful, you can log in now")
              break
          case 401:
              alert("wrongData")
              break
      }
  } catch (error) {
    console.log(error);
  }
}

async function handleLogin(e) {
  e.preventDefault()
  const form = e.currentTarget
  const url = form.action;
  try {
    const formData = new FormData(form);
    let response = await apiPost(url, formData)
      switch (response.status){
          case 200:
              document.getElementById("login-status").innerHTML = ""
              navbarManager.generateNavbar()
              const boards = await dataHandler.getBoards();
              for (let board of boards) {
                  domManager.addEventListener(`.board-title[data-board-id="${board.id}"]`,
                    "click", changeTitleHandler);
              }
              document.querySelectorAll(".column-header").forEach(elem =>{
                  elem.addEventListener("click", editColumnTitle)
              })

              break
          case 401:
              alert("wrongData")
              break
      }
  } catch (error) {
    console.log(error);
  }
}


async function handleLogout(e) {
    e.preventDefault()
    let response = await fetch("/logout", {
            method: "GET",
        });
    if (response.status === 200){
        document.getElementById("login-status").innerHTML = ""
        navbarManager.generateNavbar()
        document.getElementById("logout").className = "btn btn-default"
        document.querySelectorAll(".board-title").forEach(elem => {
            elem.removeEventListener("click", changeTitleHandler)
        })
        document.querySelectorAll(".column-header").forEach(elem => {
            // elem.removeEventListener("click", editColumnTitle)
            let old_element = elem
            let new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);
        })
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

