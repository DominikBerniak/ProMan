from flask import Flask, render_template, url_for, request, redirect
from dotenv import load_dotenv

import util
from util import json_response
import mimetypes
import queires

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/api/boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return queires.get_boards()


@app.route("/api/boards/<int:board_id>/columns/")
@json_response
def get_columns_for_board(board_id: int):
    columns_ids = queires.get_columns_for_board(board_id)
    return queires.get_columns_by_ids(columns_ids)


@app.route("/api/boards", methods=["POST"])
def add_new_board():
    json_dictionary = request.get_json()
    board_name = json_dictionary["board-name"]
    queires.add_board_to_db(board_name)
    return redirect('/api/boards')


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queires.get_cards_for_board(board_id)


@app.route("/api/boards/<int:board_id>/rename/", methods=["POST"])
def rename_board(board_id: int):
    new_board_title = request.get_json()["title"]
    queires.rename_board(board_id, new_board_title)
    return redirect("/")


@app.route("/api/boards/<int:board_id>/new-card/", methods=["POST"])
def add_new_card(board_id: int):
    card_data = request.get_json()
    board_id = card_data["boardId"]
    column_id = card_data["columnId"]
    title = card_data["cardTitle"]
    queires.add_new_card(board_id, title, column_id)
    return redirect("/")


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
