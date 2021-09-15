import data_manager


def get_boards():
    return data_manager.execute_select(
        """
        SELECT * FROM boards ORDER BY id;
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


def get_columns_for_board(board_id):
    return data_manager.execute_select(
        """
        SELECT columns_ids FROM boards
        WHERE id = %(board_id)s
        ;
        """
        , {"board_id": board_id})[0]["columns_ids"]


def get_columns_by_ids(columns_ids):
    columns_ids = tuple(columns_ids)
    return data_manager.execute_select(
        """
        SELECT * FROM columns
        WHERE id IN %(columns_ids)s
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


def add_board_to_db(board_name):
    return data_manager.execute(
        """
        INSERT INTO boards
        (title, columns_ids) VALUES (%(board_name)s, ARRAY[1,2,3,4]);
        """
        , {'board_name': board_name})


def add_new_card(board_id, title, column_id):
    data_manager.execute(
        """
        INSERT INTO cards (board_id, title, column_id)
        VALUES (%(board_id)s, %(title)s, %(column_id)s);"""
        , {"board_id": board_id, "title": title, "column_id": column_id}
    )


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