from flask import Flask, render_template, url_for, request, redirect, jsonify, session
from flask_socketio import SocketIO, send, emit
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
socketio = SocketIO(app)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/api/boards")
@json_response
def get_boards():
    return queires.get_boards()


@app.route("/api/boards/<int:board_id>/columns/")
@json_response
def get_columns_for_board(board_id: int):
    columns_ids = queires.get_columns_for_board(board_id)
    return queires.get_columns_by_ids(columns_ids)


@app.route("/api/boards", methods=["POST"])
def add_new_board():
    if session.get("username"):
        json_dictionary = request.get_json()
        board_name = json_dictionary["board-name"].replace("<", "&lt;").replace(">", "&gt;")
        user_id = queires.get_id_by_username(session.get("username"))["id"]
        if "private" in json_dictionary.keys():
            board_id = queires.add_board_to_db(board_name, user_id)["id"]
            return jsonify({"status": 200, "id": board_id, "private": True, "name": board_name})
        else:
            board_id = queires.add_board_to_db(board_name, None)["id"]
            return jsonify({"status": 200, "id": board_id, "private": False, "name": board_name})
    else:
        return jsonify({"status": 203})


@app.route("/api/register", methods=["POST"])
def register():
    json_dictionary = request.get_json()
    email = json_dictionary["email"]
    password = json_dictionary["password"]
    username = json_dictionary["username"]
    if "@" in username:
        return jsonify(json_dictionary), 203
    if queires.check_if_email_exists(email) or queires.check_if_username_exists(username):
        return jsonify(json_dictionary), 203
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
        return jsonify({"status": 200})
    else:
        return jsonify(json_dictionary), 203


@app.route('/logout')
def logout():
    session.clear()
    return jsonify({}), 200


@app.route('/getUsername')
def get_username():
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)["id"]
        data = {"username": username, "id": user_id}
        return jsonify(data), 200
    else:
        return jsonify({}), 203


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queires.get_cards_for_board(board_id)


@app.route("/api/boards/<int:board_id>/", methods=["PUT"])
def rename_board(board_id: int):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None :
            new_board_title = request.get_json()["title"]
            queires.rename_board(board_id, new_board_title)
            return jsonify({}), 200
        else:
            return jsonify({}), 203


@app.route("/api/boards/<int:board_id>/", methods=['DELETE'])
def delete_board(board_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None:
            queires.delete_cards_by_board_id(board_id)
            queires.delete_board_from_db(board_id)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route("/api/boards/archive/<board_id>", methods=["GET"])
def archive_board(board_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None:
            queires.archive_board(board_id)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route("/api/boards/restore/<board_id>", methods=["GET"])
def restore_board(board_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None:
            queires.restore_board(board_id)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route("/api/boards/<int:board_id>/<int:column_id>/cards", methods=["POST"])
def add_new_card(board_id, column_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None:
            title = request.get_json()["cardTitle"]
            card_id = queires.add_new_card(board_id, title, column_id)["id"]
            return jsonify({"cardId": card_id, "status": 200})
        else:
            return jsonify({"status": 203})


@app.route('/api/boards/columns/cards/<int:card_id>', methods=["DELETE"])
def delete_card(card_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_card_id(card_id)['owner']
        if board_owner == user_id or board_owner is None:
            queires.delete_card(card_id)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route('/api/boards/columns/cards/<int:card_id>', methods=["PUT"])
def edit_card(card_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_card_id(card_id)['owner']
        if board_owner == user_id or board_owner is None:
            title = request.get_json()["title"]
            queires.edit_card(card_id, title)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route('/api/boards/<int:board_id>/columns', methods=["POST"])
def add_column(board_id):
    column_name = request.get_json()["columnName"]
    if not data_manager.check_if_column_exists(column_name):
        queires.add_column(column_name)
        new_column_id = queires.get_latest_column_id()["id"]
    else:
        new_column_id = queires.get_column_by_name(column_name)["id"]
    queires.add_column_to_board(board_id, new_column_id)
    return jsonify({"columnId": new_column_id})


@app.route('/api/boards/<int:board_id>/columns/<int:column_id>', methods=["PUT"])
def edit_column(board_id, column_id):
    if session.get("username"):
        data = request.get_json()
        column_name = data["columnName"]
        old_column_id = column_id
        cards_ids = [int(x) for x in data["cardsIds"]]
        if not data_manager.check_if_column_exists(column_name):
            queires.add_column(column_name)
            new_column_id = queires.get_latest_column_id()["id"]
        else:
            new_column_id = queires.get_column_by_name(column_name)["id"]
        queires.update_columns_for_board(board_id, old_column_id, new_column_id)
        for card_id in cards_ids:
            queires.update_column_for_card(card_id, new_column_id)
        return jsonify({"columnId": new_column_id})
    else:
        return jsonify({}), 203


@app.route('/api/boards/<int:board_id>/columns/<int:column_id>', methods=["DELETE"])
def delete_column(board_id, column_id):
    if session.get("username"):
        username = session["username"]
        user_id = queires.get_id_by_username(username)['id']
        board_owner = queires.get_owner_by_board_id(board_id)['owner']
        if board_owner == user_id or board_owner is None:
            queires.delete_column_from_board(board_id, column_id)
            queires.delete_cards_by_board_id_and_column_id(board_id, column_id)
            return jsonify({"status": 200})
        else:
            return jsonify({"status": 203})


@app.route('/api/boards/columns/cards/<int:card_id>/status', methods = ['PUT'])
def change_column_by_card_id(card_id):
    response = request.get_json()
    column_id = response['columnId']
    queires.update_column_for_card(card_id, column_id)
    return jsonify({}), 200


@socketio.on("new board")
def new_board_broadcast(data):
    emit("new board response", data, broadcast=True)


@socketio.on("edit board")
def edit_board_broadcast(data):
    emit("edit board response", data, broadcast=True)


@socketio.on("delete board")
def delete_board_broadcast(data):
    emit("delete board response", data, broadcast=True)


@socketio.on("new column")
def new_column_broadcast(data):
    emit("new column response", data, broadcast=True)


@socketio.on("delete column")
def new_column_broadcast(data):
    emit("delete column response", data, broadcast=True)


@socketio.on("edit column")
def new_column_broadcast(data):
    emit("edit column response", data, broadcast=True)


@socketio.on("new card")
def new_column_broadcast(data):
    emit("new card response", data, broadcast=True)


@socketio.on("delete card")
def new_column_broadcast(data):
    emit("delete card response", data, broadcast=True)


@socketio.on("edit card")
def new_column_broadcast(data):
    emit("edit card response", data, broadcast=True)


def main():
    socketio.run(app)
    # app.run()
    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
