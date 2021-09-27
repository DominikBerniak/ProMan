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
            boardsManager.addBoardToDom(board);
        }
    },

    addNewBoard: async function () {
        const newBoardButton = document.getElementById("add-new-board-button");
        newBoardButton.addEventListener("click", () => {
            let modalTitle = document.querySelector("#boardModalLabel");
            modalTitle.innerHTML = "New board";
            let modalBody = document.getElementById("board-modal-body");
            modalBody.innerHTML = boardsManager.addFormToModal("Name your board:")
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
                document.querySelector(`#root .board-container[data-board-id="${boardId}"]`).remove();
                $('#confirmModal').modal('hide')
            })
    },
    addBoardToDom: async function (board) {
        const boardBuilder = htmlFactory(htmlTemplates.board);
        const content = boardBuilder(board);
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
        return `
            <form action="/api/boards" method="POST" id="board-form">
                <div class="form-group">
                    <label for="board-name" class="col-form-label">${title}</label>
                    <input type="text" class="form-control" id="board-name" name="board-name">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-default">Add</button>
                </div>
            </form>`
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

function showModal(event) {
    let modal = this
    modal.find('.modal-title').text('New board')
}

export let changeTitleHandler = function (e) {
    if (e.currentTarget.childElementCount !== 0) {
        return;
    }
    let boardId = e.currentTarget.dataset.boardId;
    let oldBoardTitle = e.currentTarget.innerHTML;
    let boardTitle = e.currentTarget;
    boardTitle.innerHTML = `
        <form class="board-title-form" action="/api/boards/${boardId}/rename/" method="post">
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

