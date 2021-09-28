import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";
import {addNewCardHandler} from "./cardsManager.js";
import {boardsManager} from "./boardsManager.js";

export let columnManager = {
    loadColumns: async function (boardId) {
        const columns = await dataHandler.getColumnByBoardId(boardId);
        let columnCount = 0;
        for (let column of columns) {
            columnCount++;
            addColumnToDom(column, boardId)
        }
        handleColumns(columnCount);
        let deleteBoardButton = deleteBoardButtonHandler(boardId)
        let addColumn = document.createElement("div")
        addColumn.classList.add("add-column-container")
        addColumn.innerHTML = `<button class="add_column_button btn header-button">Add column</button>`
        deleteBoardButton.after(addColumn)
        addColumn.querySelector("button").addEventListener("click", e => {
            addColumnHandler(boardId);
        })
        cardsManager.loadCards(boardId);
        handleDropzone()
    },
    closeColumns: function (boardId) {
        let columns = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`);
        columns.forEach(column => {
            column.remove();
        })
        let deleteBoardButton = document.querySelector(`.board-container[data-board-id="${boardId}"] .delete-board`)
        deleteBoardButton.remove()
        let addColumnButton = document.querySelector(`.board-container[data-board-id="${boardId}"] .add-column-container`)
        addColumnButton.remove();
        const button = document.querySelector(`.toggle-board-button[data-board-id="${boardId}"]`);
        button.classList.remove("bi-caret-up-square")
        button.classList.add("bi-caret-down-square")
    }
};

function handleColumns(columnCount) {
    document.querySelectorAll(".column").forEach(async column => {
        column.style.width = `${Math.floor(90 / columnCount)}%`;
        const columnHeader = column.querySelector(".column-header");
        let response = await fetch("/getUsername", {
            method: "GET",
        });
        if (response.status === 200) {
            columnHeader.addEventListener("click", e => {
                columnTitleEditDeleteHandler(e)
            })
        }
    })
}

export let columnTitleEditDeleteHandler = function (e) {
    let columnHeader = e.currentTarget;
    const oldTitle = columnHeader.innerHTML;
    if (columnHeader.childElementCount !== 0) {
        return;
    }
    columnHeader.innerHTML = getEditColumnForm(oldTitle);
    const form = columnHeader.querySelector("form");
    const input = columnHeader.querySelector("input");
    const deleteColumnButton = columnHeader.querySelector(".delete-column");
    input.focus();
    deleteColumnButton.addEventListener("click", () => {
        handleDeleteColumn(columnHeader);
    });
    let submitSuccess = false;
    form.addEventListener("submit", e => {
        submitSuccess = handleEditColumn(e, columnHeader, oldTitle, input, submitSuccess)
    })
    document.addEventListener("click", () => {
        if (input !== document.activeElement && deleteColumnButton !== document.activeElement && !submitSuccess) {
            restoreColumnTitle(columnHeader, oldTitle);
            submitSuccess = true;
        }
    })
}

function restoreColumnTitle(columnHeader, title) {
    columnHeader.innerHTML = title;
}

function checkIfColumnNameExist(columnName, boardId) {
    const board = document.querySelector(`.board[data-board-id="${boardId}"]`);
    let columnNameExists = false;
    board.querySelectorAll(".column-header").forEach(columnHeader => {
        if (columnHeader.innerHTML === columnName) {
            columnNameExists = true;
        }
    })
    return columnNameExists;
}

function addColumnHandler(boardId) {
    let modalTitle = document.querySelector("#boardModal #boardModalLabel");
    modalTitle.innerHTML = "New column";
    let modalBody = document.getElementById("board-modal-body");
    modalBody.innerHTML = boardsManager.addFormToModal("Name your column:");
    $('#boardModal').modal();
    let form = document.getElementById('board-form');
    let input = document.getElementById("board-name");
    input.value = "";
    input.focus();
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!input.value) {
            domManager.displayAlertModal('You did not put any name to your column!')
            $('#boardModal').modal('hide');
        } else if (checkIfColumnNameExist(input.value, boardId)) {
            domManager.displayAlertModal(`Column ${input.value} already exists!`)
            $('#boardModal').modal('hide');
        } else {
            dataHandler.addColumn(input.value, boardId)
                .then(async response => {
                    const columnId = response["columnId"];
                    addColumnToDom({id: columnId, name: input.value}, boardId);
                    addNewCardButton(boardId, columnId);
                    let columnCount = 0;
                    for (let column of document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`)) {
                        columnCount++;
                    }
                    handleColumns(columnCount);
                })
            $('#boardModal').modal('hide');
        }
    });
}

function deleteBoardButtonHandler(boardId) {
    let boardTitle = document.querySelector(`.board-title[data-board-id="${boardId}"]`)
    let deleteButton = document.createElement("div")
    deleteButton.classList.add('delete-board')
    let buttonElement = document.createElement('button')
    let dataAttribute = document.createAttribute('data-board-id')
    dataAttribute.value = boardId
    buttonElement.classList.add('delete_board_button', "btn");
    buttonElement.setAttributeNode(dataAttribute)
    buttonElement.innerHTML = 'Delete'
    deleteButton.appendChild(buttonElement)
    boardTitle.after(deleteButton)
    deleteButton.firstChild.addEventListener("click", () => boardsManager.handleDeleteBoard(boardId))
    return deleteButton
}

function addColumnToDom(column, boardId) {
    const columnBuilder = htmlFactory(htmlTemplates.column);
    const content = columnBuilder(column);
    domManager.addChild(`.board[data-board-id="${boardId}"]`, content);
}

function getEditColumnForm(oldTitle) {
    return `<div class="d-flex justify-content-around">
        <form>
            <input name="column-name" class="rounded" value="${oldTitle}">
        </form>
        <button class="delete-column bi bi-x-square delete-icon-button clear-button"></button>
    </div>`
}
function handleDeleteColumn(columnHeader){
    const column = columnHeader.closest(".column");
    const columnId = column.dataset.columnId;
    const boardId = column.closest(".board").dataset.boardId;
    dataHandler.deleteColumn(boardId, columnId)
        .then(() => {
            column.remove();
            const columnNum = document.querySelectorAll(`.board[data-board-id="${boardId}"] .column`).length;
            handleColumns(columnNum);
        })
}
function handleEditColumn(e, columnHeader, oldTitle, input, submitSuccess){
    e.preventDefault();
    const boardId = columnHeader.closest(".board").dataset.boardId;
    if (!input.value) {
        restoreColumnTitle(columnHeader, oldTitle);
        return submitSuccess;
    } else if (checkIfColumnNameExist(input.value, boardId)) {
        domManager.displayAlertModal(`Column ${input.value} already exists!`)
        restoreColumnTitle(columnHeader, oldTitle);
        return submitSuccess
    } else {
        submitSuccess = true;
        const column = columnHeader.closest(".column")
        const columnId = column.dataset.columnId;
        const cardsIds = [];
        column.querySelectorAll(".card").forEach(card => {
            cardsIds.push(card.dataset.cardId);
        })
        dataHandler.editColumn(input.value, columnId, boardId, cardsIds)
            .then(response => {
                column.dataset.columnId = response["columnId"];
                columnHeader.innerHTML = input.value;
            })
        return submitSuccess
    }
}
async function addNewCardButton(boardId, columnId){
    let columnElem = document.querySelector(`.board[data-board-id="${boardId}"] .column[data-column-id="${columnId}"]`);
    columnElem.removeAttribute("hidden");
    const newCardButton = document.createElement("button");
    newCardButton.innerHTML = "New Card";

    let response2 = await fetch("/getUsername", {
        method: "GET",
    });
    if (response2.status === 200) {
        newCardButton.classList.add("new-card-button", "btn", "btn-default", "mx-auto");
    } else {
        newCardButton.classList.add("new-card-button", "btn", "btn-default", "mx-auto", "hidden");
    }
    columnElem.appendChild(newCardButton);
    newCardButton.addEventListener("click", e => {
        addNewCardHandler(e, boardId, columnId)
    })
}


function handleDropzone() {
    const dropzones = document.querySelectorAll('.dropzone')
    dropzones.forEach((dropzone) => {
        dropzone.addEventListener('dragenter', handleDragEnter);
        dropzone.addEventListener('dragover', handleDragOver)
        dropzone.addEventListener('dragleave', handleDragLeave)
        dropzone.addEventListener('drop', handleDrop)
    })
}

function handleDragEnter(event) {
    event.preventDefault()


}

function handleDragOver(event) {
    event.preventDefault()
    }

function handleDragLeave(event) {
}

function handleDrop(event) {
    event.preventDefault()
    const dropzone = event.currentTarget.querySelector('.card-container')
    cardsManager.dragged.parentNode.removeChild(cardsManager.dragged)
    dropzone.appendChild(cardsManager.dragged)
}

