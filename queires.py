import data_manager


def get_boards():
    return data_manager.execute_select(
        """
        SELECT * FROM boards ORDER BY id;
        """
    )

def get_owner_by_board_id(board_id):
    return data_manager.execute_select(
        """
        SELECT owner FROM boards
        WHERE boards.id = %(board_id)s
        ;
        """
        , {"board_id": board_id}


    )

def get_owner_by_card_id(card_id):
    return data_manager.execute_select(
    """
    SELECT boards.owner
    FROM boards
    JOIN cards ON boards.id = cards.board_id
    WHERE cards.id = %(card_id)s
    ;
    """
     , {"card_id": card_id}
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


def get_columns_for_board(board_id):
    return data_manager.execute_select(
        """
        SELECT columns_ids FROM boards
        WHERE id = %(board_id)s
        ORDER BY id
        ;
        """
        , {"board_id": board_id})[0]["columns_ids"]


def get_columns_by_ids(columns_ids):
    columns_ids = tuple(columns_ids)
    return data_manager.execute_select(
        """
        SELECT * FROM columns
        WHERE id IN %(columns_ids)s
        ORDER BY id
        ;
        """
        , {"columns_ids": columns_ids})


def rename_board(board_id, new_board_title):
    data_manager.execute(
        """
        UPDATE boards
        SET title = %(new_board_title)s
        WHERE id = %(board_id)s;
        """
        , {"new_board_title": new_board_title, "board_id": board_id}
    )


def add_board_to_db(board_name, owner):
    return data_manager.execute_and_return(
        """
        INSERT INTO boards
        (title, columns_ids, owner) VALUES (%(board_name)s, ARRAY[1,2,3,4], %(owner)s)
        RETURNING id;
        """
        , {'board_name': board_name, 'owner': owner}, False)


def add_new_card(board_id, title, column_id):
    return data_manager.execute_and_return(
        """
        INSERT INTO cards (board_id, title, column_id)
        VALUES (%(board_id)s, %(title)s, %(column_id)s)
        RETURNING id;"""
        , {"board_id": board_id, "title": title, "column_id": column_id}, False
    )


def delete_board_from_db(board_id):
    return data_manager.execute(
        """
        DELETE FROM boards
        WHERE id = %(board_id)s
        """
    , {"board_id": board_id})


def delete_cards_by_board_id(board_id):
    return data_manager.execute(
        """
        DELETE FROM cards
        WHERE board_id = %(board_id)s
        """
    , {"board_id": board_id})


def delete_card(card_id):
    data_manager.execute(
        """DELETE FROM cards
            WHERE id = %(card_id)s;"""
        , {"card_id": card_id}
    )


def edit_card(card_id, title):
    data_manager.execute(
        """UPDATE cards 
            SET title = %(title)s
            WHERE id = %(card_id)s;"""
        , {"card_id": card_id, "title": title}
    )


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


def get_email_by_username(username):
    dbase_output = data_manager.execute_select("""
    SELECT email FROM users
    WHERE username = %(username)s
    """, {"username": username}, False)
    return dbase_output["email"] if dbase_output is not None else None


def get_hashed_password(email):
    output = data_manager.execute_select("""
    SELECT password FROM users
    WHERE email = %(email)s;
    """, {"email": email}, False)
    return output["password"]


def add_column(column_name):
    data_manager.execute("""
        INSERT INTO columns (name)
        VALUES (%(column_name)s);"""
        ,{"column_name": column_name}
    )


def get_latest_column_id():
    return data_manager.execute_select(
        """
        SELECT id FROM columns
        ORDER BY id DESC
        LIMIT 1;"""
        , fetchall=False
    )


def get_latest_card_id():
    return data_manager.execute_select(
        """
        SELECT id FROM cards
        ORDER BY id DESC
        LIMIT 1;"""
        , fetchall=False
    )


def get_column_by_name(column_name):
    return data_manager.execute_select(
        """
        SELECT * FROM columns
        WHERE name = %(column_name)s;"""
        , {"column_name": column_name}, False
    )


def update_columns_for_board(board_id, old_column_id, new_column_id):
    columns_ids = data_manager.execute_select(
        """SELECT columns_ids FROM boards
            WHERE id = %(board_id)s"""
        , {"board_id": board_id}, False
    )["columns_ids"]
    for i in range(len(columns_ids)):
        if columns_ids[i] == old_column_id:
            columns_ids[i] = new_column_id
    data_manager.execute(
        """UPDATE boards
            SET columns_ids = %(columns_ids)s
            WHERE id = %(board_id)s;"""
        , {"columns_ids": columns_ids, "board_id": board_id}
    )


def update_column_for_card(card_id, new_column_id):
    data_manager.execute(
        """UPDATE cards
            SET column_id = %(new_column_id)s
            WHERE id = %(card_id)s;"""
        , {"new_column_id": new_column_id, "card_id": card_id}
    )


def add_column_to_board(board_id, new_column_id):
    data_manager.execute(
        """UPDATE boards
            SET columns_ids = ARRAY_APPEND(columns_ids, %(new_column_id)s)
            WHERE id = %(board_id)s;"""
        , {"new_column_id": new_column_id, "board_id": board_id}
    )


def delete_column_from_board(board_id, column_id):
    data_manager.execute(
        """UPDATE boards
            SET columns_ids = ARRAY_REMOVE(columns_ids, %(column_id)s)
            WHERE id = %(board_id)s;"""
        , {"board_id": board_id, "column_id": column_id}
    )


def delete_cards_by_board_id_and_column_id(board_id,column_id):
    data_manager.execute(
        """DELETE FROM cards
            WHERE board_id = %(board_id)s AND column_id = %(column_id)s;
        """
        , {"board_id": board_id, "column_id": column_id}
    )


def get_id_by_username(username):
    return data_manager.execute_select(f"""
        SELECT id 
        FROM users
        WHERE username='{username}'
    """)