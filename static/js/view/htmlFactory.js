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
    return `<div class="board-container" data-board-id="${board.id}">
                <div class="board-header">
                    <div class="board-title" data-board-id="${board.id}">${board.title}</div>
                    <button class="toggle-board-button" data-board-id="${board.id}">V</button>
                </div>
                <div class="board" data-board-id=${board.id}></div>
            </div>`;
}

function columnBuilder(column){
    return `<div class="column" data-column-id="${column.id}" hidden><div class="column-header">${column.name}</div></div>`;
}

function cardBuilder(card) {
    return `<div class="card" data-card-id="${card.id}">${card.title}</div>`;
}

