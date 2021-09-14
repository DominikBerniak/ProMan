import {boardsManager} from "../controller/boardsManager.js";

export let dataHandler = {
  getBoards: async function () {
    return await apiGet("/api/boards");
  },
  getColumnByBoardId: async function (boardId) {
    const response = await apiGet(`/api/boards/${boardId}/columns/`);
    return response;
  },
  getBoard: async function (boardId) {
    // the board is retrieved and then the callback function is called with the board
  },
  getStatuses: async function () {
    // the statuses are retrieved and then the callback function is called with the statuses
  },
  getStatus: async function (statusId) {
    // the status is retrieved and then the callback function is called with the status
  },
  getCardsByBoardId: async function (boardId) {
    const response = await apiGet(`/api/boards/${boardId}/cards/`);
    return response;
  },
  getCard: async function (cardId) {
    // the card is retrieved and then the callback function is called with the card
  },
  createNewBoard: async function (e) {
      console.log(e)
        e.preventDefault()
        const form = e.currentTarget
        const url = form.action;
        console.log(url)
        try {
            const formData = new FormData(form);
            await apiPost(url, formData).then(()=> {
                reloadBoards(form);
            })
        }catch (error){
            console.log(error);
        }
  },
    renameBoard: async function(e){
        const form = e.currentTarget;
        const url = form.action;
        try {
            const formData = new FormData(form);
            return await apiPost(url, formData)
        }catch (error){
            console.log(error);
        }
    },
    createNewCard: async function (cardTitle, boardId, columnId) {
        let url = `/api/boards/${boardId}/new-card/`;
        try {
            const data = {"cardTitle": cardTitle, "boardId":boardId, "columnId": columnId};
            return await apiPost(url, data, false);
        }catch (error){
            console.log(error);
        }
  },
};

function reloadBoards(form){
    let root = document.getElementById("root")
    root.innerHTML = ''
    boardsManager.loadBoards();
    form.querySelector("input").value="";
}
async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.status === 200) {
    let data = response.json();
    return data;
  }
}

async function apiPost(url, data, dataFromForm=true) {
    if (dataFromForm){
        data = Object.fromEntries(data.entries());
    }
    const formDataJsonString = JSON.stringify(data);
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

async function apiDelete(url) {}

async function apiPut(url) {}
