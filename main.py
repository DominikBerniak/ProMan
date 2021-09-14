from flask import Flask, render_template, url_for, request, redirect, jsonify, session
from dotenv import load_dotenv

import data_manager
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


@app.route("/api/boards", methods=["POST"])
def add_new_board():
    json_dictionary = request.get_json()
    print(json_dictionary)
    board_name = json_dictionary["board-name"]
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
        print((session))

        return session, 200
    else:
        return jsonify(json_dictionary), 401


@app.route('/logout')
def logout():
    session.clear()
    return redirect("/")


@app.route('/getUsername')
def get_username():
    if session.get("username"):
        username = {"username": session["username"]}
        print(username)
        return jsonify(username), 200
    else:
        return jsonify({}), 404



@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queires.get_cards_for_board(board_id)




def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
