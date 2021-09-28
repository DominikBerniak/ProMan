import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {columnManager} from "./columnManager.js";
import {cardsManager} from "./cardsManager.js";

export let boardsManager = {
    root: document.getElementById("root"),
    loadBoards: async function () {
        const boards = await dataHandler.getBoards();
        for (let board of boards) {
            if (board["owner"] !== null && board["owner"] == localStorage.getItem("userId")){
                boardsManager.addBoardToDom(board, true);
            }
            else if (board["owner"] === null) {
                boardsManager.addBoardToDom(board);
            }
        }
    },
    addNewBoard: async function () {
        const newBoardButton = document.getElementById("add-new-board-button");
        newBoardButton.addEventListener("click", () => {
            let modalTitle = document.querySelector("#boardModalLabel");
            modalTitle.innerHTML = "New board";
            let modalBody = document.getElementById("board-modal-body");
            modalBody.innerHTML = boardsManager.addFormToModal("Name your board:", "Board title")
            $('#boardModal').modal();
            let form = document.getElementById('board-form');
            let input = document.getElementById("board-name");
            input.value = "";
            input.focus();
            form.addEventListener('submit', e => {
                e.preventDefault();
                if(!input.value){
                    $('#boardModal').modal('hide');
                } else {
                    dataHandler.createNewBoard(e);
                    $('#boardModal').modal('hide');
                }
            })
        })
    },
    handleDeleteBoard: function (boardId) {
        domManager.displayConfirmModal("Are you sure you want to delete this board?")
        domManager.addEventListener('#confirmButton',
            'click',
            function () {
                dataHandler.deleteBoard(boardId)
                    .then(()=>{
                        domManager.displayAlertModal("Board successfully deleted.");
                    })
                document.querySelector(`#root .board-container[data-board-id="${boardId}"]`).remove();
                $('#confirmModal').modal('hide')
            })
    },
    addBoardToDom: async function (board, isPrivate=false) {
        const boardBuilder = htmlFactory(htmlTemplates.board);
        const content = boardBuilder(board, isPrivate);
        domManager.addChild("#root", content);
        domManager.addEventListener(
            `.toggle-board-button[data-board-id="${board.id}"]`,
            "click",
            showHideButtonHandler);
        if (localStorage.getItem("username") !== null){
            domManager.addEventListener(`.board-title[data-board-id="${board.id}"]`,
                "click",
                changeTitleHandler);
        }
    },
    addFormToModal: function (title) {
        let output = `
            <form action="/api/boards" method="POST" id="board-form">
                <div class="form-group">
                    <label for="board-name" class="col-form-label">${title}</label>
                    <input type="text" class="form-control" id="board-name" name="board-name" placeholder="${placeholder}">
                </div>
                <div class="modal-footer">`
                    if (checkbox){
                        output += `<input type="checkbox" name="private" id="checkbox">
                        <label for="checkbox">Private</label>`
                    }
                    output += `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-default">Add</button>
                </div>
            </form>`
        return output
    },
    initRefreshPageButton: function (){
        const refreshPageButton = document.getElementById("refresh-page");
        refreshPageButton.addEventListener("click", ()=>{
            reloadBoards();
        })
    }
};

function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    const board = document.querySelector(`.board[data-board-id="${boardId}"]`);
    if (board.childElementCount === 0) {
        columnManager.loadColumns(boardId)
    } else {
        columnManager.closeColumns(boardId);
    }
}

export let changeTitleHandler = function (e) {
    if (e.currentTarget.childElementCount !== 0) {
        return;
    }
    let boardId = e.currentTarget.dataset.boardId;
    let oldBoardTitle = e.currentTarget.innerHTML;
    let boardTitle = e.currentTarget;
    boardTitle.innerHTML = `
        <form class="board-title-form" action="/api/boards/${boardId}/">
            <input class="rounded" name="title" value="${oldBoardTitle}">
        </form>`
    const form = boardTitle.querySelector("form");
    let input = boardTitle.querySelector("input");
    input.focus();
    input.addEventListener("focusout", () => {
        boardTitle.innerHTML = oldBoardTitle;
    });
    form.addEventListener("submit", e => {
        e.preventDefault();
        if (!input.value) {
            input.blur();
        } else {
            dataHandler.renameBoard(e)
                .then(() => {
                    boardTitle.innerHTML = input.value;
                });
        }
    });
}

function reloadBoards() {
    let root = document.getElementById("root")
    root.innerHTML = '';
    boardsManager.loadBoards();
}

