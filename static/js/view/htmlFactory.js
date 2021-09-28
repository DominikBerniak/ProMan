export const htmlTemplates = {
    board: 1,
    column: 2,
    card: 3,
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.column:
            return columnBuilder
        case htmlTemplates.card:
            return cardBuilder
        default:
            console.error("Undefined template: " + template)
            return () => { return "" }
    }
}

function boardBuilder(board) {
    return `<div class="board-container rounded" data-board-id="${board.id}">
                <div class="board-header border rounded p-2">
                    <div class="board-title" data-board-id="${board.id}">${board.title}</div>
                    <button class="toggle-board-button bi bi-caret-down-square" data-board-id="${board.id}"></button>
                </div>
                <div class="board" data-board-id=${board.id}></div>
            </div>`;
}

function columnBuilder(column){
    return `<div class="column rounded m-2 p-2 d-flex flex-column dropzone" data-column-id="${column.id}" hidden>
                <div class="column-header p-1">${column.name}</div>
                <div class="card-container"></div>
            </div>`;
}

function cardBuilder(card) {
    return `<div class="card p-2 mt-1 mb-1" draggable="true" data-card-id="${card.id}">${card.title}</div>`;
}
