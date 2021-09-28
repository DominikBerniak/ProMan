import {boardsManager} from "../controller/boardsManager.js";
import {domManager} from "../view/domManager.js";

export let dataHandler = {
    getBoards: async function () {
        return await apiGet("/api/boards");
    },
    getColumnByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/columns/`);
    },
    getCardsByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/cards/`);
    },
    createNewBoard: async function (e) {
        e.preventDefault()
        const form = e.currentTarget;
        const url = form.action;
        try {
            const formData = new FormData(form);
            let response = await apiPost(url, formData);
            console.log(response.status);
            switch (response.status){
                case 200:
                    let newBoard = {
                        "columns_ids": [1, 2, 3, 4],
                        "id": response.id,
                        "title": formData.get("board-name")
                    };
                    if (formData.get("private")) {
                        boardsManager.addBoardToDom(newBoard, true);
                    }
                    else {
                        boardsManager.addBoardToDom(newBoard);
                    }
                    break;
                case 203:
                    domManager.displayAlertModal("You are not allowed to add new board. Try to " +
                        "log in again.")
            }
        } catch (error) {
            console.log(error);
        }
    },
    renameBoard: async function (e) {
        const form = e.currentTarget;
        const url = form.action;
        try {
            const formData = new FormData(form);
            return await apiPut(url, formData)
        }catch (error){
            console.log(error);
        }
    },
    deleteBoard: async function (boardId) {
        const url = `/api/boards/${boardId}/`;
        try {
            return await apiDelete(url);
        } catch (error) {
            console.log(error);
        }
    },
    createNewCard: async function (cardTitle, boardId, columnId) {
        let url = `/api/boards/${boardId}/${columnId}/cards`;
        try {
            const data = {"cardTitle": cardTitle};
            return await apiPost(url, data, false);
        } catch (error) {
            console.log(error);
        }
    },
    deleteCard: async function (cardId) {
        const url = `/api/boards/columns/cards/${cardId}`;
        try {
            return await apiDelete(url);
        } catch (error) {
            console.log(error);
        }
    },
    editCard: async function (cardId, title) {
        const url = `/api/boards/columns/cards/${cardId}`;
        try {
            const data = {"title": title};
            return await apiPut(url, data, false);
        } catch (error) {
            console.log(error);
        }
    },
    addColumn: async function (columnName, boardId) {
        const url = `/api/boards/${boardId}/columns`;
        try {
            const data = {"columnName": columnName};
            return await apiPost(url, data, false);
        } catch (error) {
            console.log(error);
        }
    },
    editColumn: async function (columnName, columnId, boardId, cardsIds) {
        const url = `/api/boards/${boardId}/columns/${columnId}`;
        try {
            const data = {"columnName": columnName, "cardsIds": cardsIds};
            return await apiPut(url, data, false);
        } catch (error) {
            console.log(error);
        }
    },
    deleteColumn: async function (boardId, columnId) {
        const url = `/api/boards/${boardId}/columns/${columnId}`;
        try {
            return await apiDelete(url);
        } catch (error) {
            console.log(error);
        }
    },
};

async function apiGet(url) {
    let response = await fetch(url, {
        method: "GET",
    });
    if (response.status === 200) {
        let data = response.json();
        return data;
    }
}

async function apiPost(url, data, dataFromForm = true) {
    if (dataFromForm) {
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
    return response.json();
}

async function apiDelete(url) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

async function apiPut(url, data, dataFromForm = true) {
    if (dataFromForm) {
        data = Object.fromEntries(data.entries());
    }
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
