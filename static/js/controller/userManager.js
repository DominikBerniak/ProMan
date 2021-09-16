import { domManager } from "../view/domManager.js";
import { navbarManager } from "./navbarManager.js";



export let userManager = {
  registerUser: function () {
    // domManager.addEventListener('#registerModal',
    //     'show.bs.modal',
    //     showModal)
    let form = document.getElementById('register_form')
    form.addEventListener('submit', function (e) {
      handleRegistration(e)
      $('#registerModal').modal('hide');
    })
  },
    loginUser: function () {
    domManager.addEventListener('#loginModal',
        'show.bs.modal',
        showModal)
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

