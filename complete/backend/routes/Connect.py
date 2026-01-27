from flask import Blueprint, jsonify, session
from db_config import mysql
import MySQLdb.cursors
from flask import request

connect_bp = Blueprint('connect_bp', __name__)

@connect_bp.route('/suggested', methods=['GET'])
def suggested_connections():
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401

    user_id = session['user_id']
    # Use DictCursor so we can access by column name
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT SKILLS FROM REGISTRATION WHERE ID = %s", (user_id,))
    user = cursor.fetchone()

    if not user or not user['SKILLS']:
        return jsonify({'message': 'No skills found for this user'}), 404

    user_skills = [skill.strip().lower() for skill in user['SKILLS'].split(',')]

    # Get all other users
    cursor.execute("SELECT ID, NAME, EMAIL, SCHOOL, SKILLS, INTEREST FROM REGISTRATION WHERE ID != %s", (user_id,))
    all_users = cursor.fetchall()

    # Get already connected or requested user IDs (exclude from suggestions)
    cursor.execute("SELECT connected_user_id FROM CONNECTIONS WHERE user_id = %s", (user_id,))
    connected_rows = cursor.fetchall()
    connected = [row['connected_user_id'] for row in connected_rows]
    cursor.close()

    suggested = []
    for u in all_users:
        if u['ID'] in connected:
            continue
        if not u['SKILLS']:
            continue
        other_skills = [s.strip().lower() for s in u['SKILLS'].split(',')]
        common = set(user_skills) & set(other_skills)
        if common:
            suggested.append({
                'id': u['ID'],
                'name': u['NAME'],
                'school': u['SCHOOL'],
                'skills': u['SKILLS'],
                'interest': u['INTEREST'],
                'common_skills': list(common)
            })

    return jsonify({'suggested': suggested})

# ------------------ CONNECT WITH A USER ------------------
@connect_bp.route('/add', methods=['POST'])
def add_connection():
    # Ensure the CONNECTIONS table has a status column (requested/accepted).
    # If it doesn't, try to add it (safe for development).
    try:
        c = mysql.connection.cursor()
        c.execute("ALTER TABLE CONNECTIONS ADD COLUMN status VARCHAR(20) DEFAULT 'accepted'")
        mysql.connection.commit()
        c.close()
    except Exception:
        # ignore errors (column may already exist)
        try:
            c.close()
        except Exception:
            pass

    # read request body
    # from flask import request
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401

    data = request.json
    connect_to = data.get('connect_to')

    if not connect_to:
        return jsonify({'message': 'Missing connect_to user ID'}), 400

    user_id = session['user_id']
    cursor = mysql.connection.cursor()

    # Check if already connected
    cursor.execute("SELECT * FROM CONNECTIONS WHERE user_id = %s AND connected_user_id = %s", (user_id, connect_to))
    existing = cursor.fetchone()
    if existing:
        return jsonify({'message': 'Already connected'}), 400

    # Add new connection with status 'requested'
    try:
        cursor.execute("INSERT INTO CONNECTIONS (user_id, connected_user_id, status) VALUES (%s, %s, %s)", (user_id, connect_to, 'requested'))
    except Exception:
        # fallback if column doesn't exist
        cursor.execute("INSERT INTO CONNECTIONS (user_id, connected_user_id) VALUES (%s, %s)", (user_id, connect_to))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'Connection added successfully!'})


@connect_bp.route('/requests', methods=['GET'])
def incoming_requests():
    """Return incoming connection requests for the current user (where connected_user_id == current and status='requested')."""
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401

    user_id = session['user_id']
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT C.user_id AS requester_id, U.ID, U.NAME, U.EMAIL, U.SCHOOL, U.SKILLS, U.INTEREST FROM CONNECTIONS C JOIN REGISTRATION U ON C.user_id = U.ID WHERE C.connected_user_id = %s AND C.status = 'requested'", (user_id,))
    rows = cursor.fetchall()
    cursor.close()
    requests = []
    for r in rows:
        requests.append({
            'requester_id': r['requester_id'],
            'id': r['ID'],
            'name': r['NAME'],
            'email': r.get('EMAIL'),
            'school': r.get('SCHOOL'),
            'skills': r.get('SKILLS'),
            'interest': r.get('INTEREST')
        })
    return jsonify({'requests': requests})


@connect_bp.route('/accept', methods=['POST'])
def accept_request():
    """Accept a pending connection request. Body should contain {'requester_id': <id>}.
    This sets status='accepted' for the row where user_id=requester_id and connected_user_id=current_user.
    """
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401
    data = request.json or {}
    requester = data.get('requester_id')
    if not requester:
        return jsonify({'message': 'Missing requester_id'}), 400

    user_id = session['user_id']
    cursor = mysql.connection.cursor()
    # update status to accepted
    try:
        cursor.execute("UPDATE CONNECTIONS SET status = 'accepted' WHERE user_id = %s AND connected_user_id = %s", (requester, user_id))
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({'message': 'Failed to accept request', 'error': str(e)}), 500
    cursor.close()
    return jsonify({'message': 'Request accepted'})

# ------------------ VIEW MY CONNECTIONS ------------------
@connect_bp.route('/my-connections', methods=['GET'])
def my_connections():
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401

    user_id = session['user_id']
    # Try to return only ACCEPTED connections and include both directions
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        sql = (
            "SELECT U.ID, U.NAME, U.EMAIL, U.SCHOOL, U.SKILLS, U.INTEREST "
            "FROM CONNECTIONS C "
            "JOIN REGISTRATION U ON U.ID = C.connected_user_id "
            "WHERE C.user_id = %s AND C.status = 'accepted' "
            "UNION "
            "SELECT U2.ID, U2.NAME, U2.EMAIL, U2.SCHOOL, U2.SKILLS, U2.INTEREST "
            "FROM CONNECTIONS C2 "
            "JOIN REGISTRATION U2 ON U2.ID = C2.user_id "
            "WHERE C2.connected_user_id = %s AND C2.status = 'accepted'"
        )
        cursor.execute(sql, (user_id, user_id))
        connections = cursor.fetchall()
        cursor.close()
        return jsonify({'connections': connections})
    except Exception:
        # Fallback if status column doesn't exist: include both directions without status filter
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            sql = (
                "SELECT U.ID, U.NAME, U.EMAIL, U.SCHOOL, U.SKILLS, U.INTEREST "
                "FROM CONNECTIONS C "
                "JOIN REGISTRATION U ON U.ID = C.connected_user_id "
                "WHERE C.user_id = %s "
                "UNION "
                "SELECT U2.ID, U2.NAME, U2.EMAIL, U2.SCHOOL, U2.SKILLS, U2.INTEREST "
                "FROM CONNECTIONS C2 "
                "JOIN REGISTRATION U2 ON U2.ID = C2.user_id "
                "WHERE C2.connected_user_id = %s "
            )
            cursor.execute(sql, (user_id, user_id))
            connections = cursor.fetchall()
            cursor.close()
            return jsonify({'connections': connections})
        except Exception as e:
            try:
                cursor.close()
            except Exception:
                pass
            return jsonify({'message': 'Failed to fetch connections', 'error': str(e)}), 500


@connect_bp.route('/all', methods=['GET'])
def all_users():
    """Return all users except the current user, and include whether they are connected."""
    if 'user_id' not in session:
        return jsonify({'message': 'Please log in first'}), 401

    user_id = session['user_id']
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Get all other users
    cursor.execute("SELECT ID, NAME, EMAIL, SCHOOL, SKILLS, INTEREST FROM REGISTRATION WHERE ID != %s", (user_id,))
    all_users = cursor.fetchall()

    # Get already connected user IDs
    cursor.execute("SELECT connected_user_id FROM CONNECTIONS WHERE user_id = %s", (user_id,))
    connected_rows = cursor.fetchall()
    connected = set(r['connected_user_id'] for r in connected_rows)

    cursor.close()

    result = []
    for u in all_users:
        result.append({
            'id': u['ID'],
            'name': u['NAME'],
            'email': u.get('EMAIL'),
            'school': u.get('SCHOOL'),
            'skills': u.get('SKILLS'),
            'interest': u.get('INTEREST'),
            'connected': u['ID'] in connected
        })

    return jsonify({'students': result})

