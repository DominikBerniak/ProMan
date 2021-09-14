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
    # new_board_title = request.get_json()["title"]
    new_board_title = request.form.get("title")
    queires.rename_board(board_id, new_board_title)
    return redirect("/")


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
