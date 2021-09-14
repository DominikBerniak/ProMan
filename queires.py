import data_manager


def get_card_status(status_id):
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id})
    return status


def get_boards():
    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ;
        """
    )


def get_cards_for_board(board_id):
    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ;
        """
        , {"board_id": board_id})

    return matching_cards


def add_board_to_db(board_name):
    return data_manager.execute(
        """
        INSERT INTO boards
        (title) VALUES (%(board_name)s);
        """
        , {'board_name': board_name})


def register(email, username, hashed_password):
    return data_manager.execute(
        """
        INSERT INTO users (username, email, password)
        VALUES (%(username)s, %(email)s, %(hashed_password)s);
        """
        , {'username': username, 'email': email, "hashed_password": hashed_password})


def check_if_email_exists(email):
    dbase_output = data_manager.execute_select(
        """SELECT id FROM users
           WHERE email = %(email)s;"""
        , {"email": email}
    )
    return False if dbase_output == [] else True


def check_if_username_exists(username):
    dbase_output = data_manager.execute_select(
        """SELECT id FROM users
           WHERE username = %(username)s;"""
        , {"username": username}
    )
    return False if dbase_output == [] else True