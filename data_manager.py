import os

import bcrypt
import psycopg2
import psycopg2.extras

import queires


def establish_connection(connection_data=None):
    """
    Create a database connection based on the :connection_data: parameter
    :connection_data: Connection string attributes
    :returns: psycopg2.connection
    """
    if connection_data is None:
        connection_data = get_connection_data()
    try:
        connect_str = "dbname={} user={} host={} password={}".format(connection_data['dbname'],
                                                                     connection_data['user'],
                                                                     connection_data['host'],
                                                                     connection_data['password'])
        conn = psycopg2.connect(connect_str)
        conn.autocommit = True
    except psycopg2.DatabaseError as e:
        print("Cannot connect to database.")
        print(e)
    else:
        return conn


def get_connection_data(db_name=None):
    """
    Give back a properly formatted dictionary based on the environment variables values which are started
    with :MY__PSQL_: prefix
    :db_name: optional parameter. By default it uses the environment variable value.
    """
    if db_name is None:
        db_name = os.environ.get('MY_PSQL_DBNAME')

    return {
        'dbname': db_name,
        'user': os.environ.get('MY_PSQL_USER'),
        'host': os.environ.get('MY_PSQL_HOST'),
        'password': os.environ.get('MY_PSQL_PASSWORD')
    }


def execute_select(statement, variables=None, fetchall=True):
    """
    Execute SELECT statement optionally parameterized.
    Use fetchall=False to get back one value (fetchone)

    Example:
    > execute_select('SELECT %(title)s; FROM shows', variables={'title': 'Codecool'})
    statement: SELECT statement
    variables:  optional parameter dict, optional parameter fetchall"""
    result_set = []
    with establish_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(statement, variables)
            result_set = cursor.fetchall() if fetchall else cursor.fetchone()
    return result_set


def execute(statement, variables):
    with establish_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(statement, variables)


def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf8"), salt)
    return hashed_password.decode("utf8")


def register(email, username, password):
    hashed_password = hash_password(password)
    queires.register(email, username, hashed_password)


def check_password(email, password_to_check):
    hashed_password = queires.get_hashed_password(email).encode("utf8")
    password_to_check = password_to_check.encode("utf8")
    return bcrypt.checkpw(password_to_check, hashed_password)


def check_if_column_exists(column_name):
    return queires.get_column_by_name(column_name) is not None
