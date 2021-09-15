from flask import Flask, render_template, url_for, request, redirect, jsonify, session
from dotenv import load_dotenv
import data_manager
import util
from util import json_response
import mimetypes
import queires


mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()
app.secret_key = "\xfd\x1b\xc9]0\x17\x1a\xd1\xe4\xf4#a\xbd/\xeb"


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
    if board_name != '':
        queires.add_board_to_db(board_name)
    return redirect('/api/boards')


@app.route("/api/register", methods=["POST"])
def register():
    json_dictionary = request.get_json()
    email = json_dictionary["email"]
    password = json_dictionary["password"]
    username = json_dictionary["username"]
    # zabezpiecz przed maupą w username
    if queires.check_if_email_exists(email) or queires.check_if_username_exists(username):
        return jsonify(json_dictionary), 401
    else:
        data_manager.register(email, username, password)
        return jsonify(json_dictionary), 200


@app.route("/api/login", methods=["POST"])
def login():
    json_dictionary = request.get_json()
    login = json_dictionary["login"]
    password = json_dictionary["password"]
    if "@" in login:
        column = "email"
        username = None
        email = login
    else:
        column = "username"
        username = login
        email = None
    if not email:
        email = queires.get_email_by_username(username)
    if queires.check_if_email_exists(email) and data_manager.check_password(email, password):
        session["email"] = email
        session["username"] = username
        return session, 200
    else:
        return jsonify(json_dictionary), 401


@app.route('/logout')
def logout():
    session.clear()
    print("dupa")
    return jsonify({}), 200


@app.route('/getUsername')
def get_username():
    if session.get("username"):
        username = {"username": session["username"]}
        return jsonify(username), 200
    else:
        return jsonify({}), 401



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


@app.route("/api/boards/<int:board_id>/delete", methods=['POST'])
def delete_board(board_id):
    queires.delete_cards_by_board_id(board_id)
    queires.delete_board_from_db(board_id)
    return redirect("/")


@app.route("/api/boards/<int:board_id>/new-card/", methods=["POST"])
def add_new_card(board_id: int):
    card_data = request.get_json()
    board_id = card_data["boardId"]
    column_id = card_data["columnId"]
    title = card_data["cardTitle"]
    queires.add_new_card(board_id, title, column_id)
    return redirect("/")


@app.route('/api/boards/cards/delete/', methods=["POST"])
def delete_card():
    card_id = request.get_json()["cardId"]
    queires.delete_card(card_id)
    return redirect("/")


@app.route('/api/boards/cards/edit/', methods=["POST"])
def edit_card():
    json = request.get_json()
    card_id = json["cardId"]
    title = json["title"]
    queires.edit_card(card_id, title)
    return redirect("/")


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
