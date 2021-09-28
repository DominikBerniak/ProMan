import {domManager} from "../view/domManager.js";
import {navbarManager} from "./navbarManager.js";
import {boardsManager} from "./boardsManager.js";
import {dataHandler} from "../data/dataHandler.js";
import {changeTitleHandler} from "./boardsManager.js";
import {
    addColumnHandler,
    columnManager,
    columnTitleEditDeleteHandler,
    deleteBoardButtonHandler
} from "./columnManager.js";
import {cardEditDeleteHandler} from "./cardsManager.js";


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
    },
    checkLoginStatus: async function () {
        let response = await fetch("/getUsername", {
            method: "GET",
        });
        if (response.status === 200) {
            response.json().then(data => {
                localStorage.setItem("username", data["username"]);
                localStorage.setItem("userId", data["id"]);
            })
        } else {
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
        }
    }
}


async function handleRegistration(e) {
    e.preventDefault()
    const form = e.currentTarget
    const url = form.action;
    try {
        const formData = new FormData(form);
        let response = await apiPost(url, formData)
        switch (response.status) {
            case 200:
                domManager.displayAlertModal("Registration successful, you can log in now")
                break
            case 203:
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
        switch (response.status) {
            case 200:
                userManager.checkLoginStatus()
                domManager.displayAlertModal("Login successful!")
                document.getElementById("login-status").innerHTML = ""
                const boards = await dataHandler.getBoards();
                for (let board of boards) {
                    domManager.addEventListener(`.board-title[data-board-id="${board.id}"]`,
                        "click", changeTitleHandler);
                }
                document.querySelectorAll(".column-header").forEach(elem => {
                    elem.addEventListener("click", columnTitleEditDeleteHandler)
                })
                document.querySelectorAll(".new-card-button").forEach(elem => {
                    elem.classList.remove("hidden")
                })
                let cards = document.querySelectorAll(".card")
                for (let card of cards) {
                    domManager.addEventListener(
                        `.card[data-card-id="${card.getAttribute("data-card-id")}"]`,
                        "click",
                        cardEditDeleteHandler
                    );
                }
                for (let board of document.querySelectorAll(".board")) {
                    if (board.childElementCount !== 0) {
                        let boardId = board.parentElement.getAttribute("data-board-id")
                        let deleteBoardButton = deleteBoardButtonHandler(boardId)
                        let addColumn = document.createElement("div")
                        addColumn.classList.add("add-column-container")
                        addColumn.innerHTML = `<button class="add_column_button btn header-button">Add column</button>`
                        deleteBoardButton.after(addColumn)
                        addColumn.querySelector("button").addEventListener("click", e => {
                            addColumnHandler(boardId);
                        })
                    }
                }
                navbarManager.generateNavbar()
                break
            case 203:
                domManager.displayAlertModal("Wrong data, please try again!")
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
    if (response.status === 200) {
        domManager.displayAlertModal("Logout successful!")
        document.getElementById("login-status").innerHTML = ""
        document.getElementById("logout").className = "btn btn-default"
        document.querySelectorAll(".board-title").forEach(elem => {
            elem.removeEventListener("click", changeTitleHandler)
        })
        document.querySelectorAll(".column-header").forEach(elem => {
            let old_element = elem;
            let new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);
        })
        document.querySelectorAll(".card").forEach(card => {
            let old_card = card;
            let new_card = old_card.cloneNode(true);
            old_card.parentNode.replaceChild(new_card, old_card);
        })
        document.querySelectorAll(".new-card-button").forEach(elem => {
            elem.classList.add("hidden")
        })
        document.querySelectorAll(".delete_board_button").forEach(button => {
            button.remove()
        })
        document.querySelectorAll(".add_column_button").forEach(button => {
            button.remove()
        })


        navbarManager.generateNavbar()
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




