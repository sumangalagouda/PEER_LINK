from flask import Blueprint, request, jsonify, session
from db_config import mysql
import MySQLdb.cursors

group_bp = Blueprint('group_bp', __name__)

# ---------------- CREATE GROUP ----------------
@group_bp.route('/create', methods=['POST'])
def create_group():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    data = request.json
    group_name = data.get('group_name')
    creator_id = session['user_id']

    cursor = mysql.connection.cursor()

    # Create group
    cursor.execute("""
        INSERT INTO STDGROUP (group_name, created_by)
        VALUES (%s, %s)
    """, (group_name, creator_id))

    group_id = cursor.lastrowid

    # Add creator as member
    cursor.execute("""
        INSERT INTO GROUP_MEMBERS (group_id, user_id)
        VALUES (%s, %s)
    """, (group_id, creator_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'Group created', 'group_id': group_id}), 201


@group_bp.route('/add_member', methods=['POST'])
def add_member():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    data = request.json
    group_id = data['group_id']
    user_id = data['user_id']

    cursor = mysql.connection.cursor()

    # Check if already added
    cursor.execute("""
        SELECT * FROM GROUP_MEMBERS WHERE group_id=%s AND user_id=%s
    """, (group_id, user_id))

    if cursor.fetchone():
        return jsonify({'message': 'User already in group'}), 400

    # Enforce: only add users you are connected (accepted) with
    try:
        c2 = mysql.connection.cursor()
        c2.execute(
            """
            SELECT 1 FROM CONNECTIONS
            WHERE ((user_id=%s AND connected_user_id=%s) OR (user_id=%s AND connected_user_id=%s))
              AND status='accepted'
            LIMIT 1
            """,
            (session['user_id'], user_id, user_id, session['user_id'])
        )
        ok = c2.fetchone()
        c2.close()
        if not ok:
            cursor.close()
            return jsonify({'message': 'You can only add connected (accepted) users to a group'}), 403
    except Exception:
        # If status column missing, fallback to existence of any connection row in either direction
        try:
            c3 = mysql.connection.cursor()
            c3.execute(
                """
                SELECT 1 FROM CONNECTIONS
                WHERE (user_id=%s AND connected_user_id=%s) OR (user_id=%s AND connected_user_id=%s)
                LIMIT 1
                """,
                (session['user_id'], user_id, user_id, session['user_id'])
            )
            ok2 = c3.fetchone()
            c3.close()
            if not ok2:
                cursor.close()
                return jsonify({'message': 'You can only add connected users to a group'}), 403
        except Exception:
            pass

    # Add user to group
    cursor.execute("""
        INSERT INTO GROUP_MEMBERS (group_id, user_id)
        VALUES (%s, %s)
    """, (group_id, user_id))

    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'User added successfully'}), 200

@group_bp.route('/my_groups', methods=['GET'])
def get_my_groups():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    user_id = session['user_id']
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""
        SELECT G.id, G.group_name, G.created_by, G.created_at
        FROM STDGROUP G
        JOIN GROUP_MEMBERS M ON G.id = M.group_id
        WHERE M.user_id = %s
    """, (user_id,))

    groups = cursor.fetchall()
    cursor.close()

    return jsonify({'groups': groups}), 200


# ---------------- GROUP MESSAGING ----------------
@group_bp.route('/messages/<int:group_id>', methods=['GET'])
def get_group_messages(group_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    user_id = session['user_id']
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # verify membership
    cursor.execute("SELECT 1 FROM GROUP_MEMBERS WHERE group_id=%s AND user_id=%s", (group_id, user_id))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'message': 'Not a member of this group'}), 403

    # Inspect columns of GROUP_MESSAGES (do not mutate schema here)
    try:
        c2 = mysql.connection.cursor()
        c2.execute("SHOW COLUMNS FROM GROUP_MESSAGES")
        cols = [row[0].lower() for row in c2.fetchall()]
        c2.close()
    except Exception as e:
        try:
            c2.close()
        except Exception:
            pass
        return jsonify({'message': 'GROUP_MESSAGES table not found or unreadable', 'error': str(e)}), 500

    # Build select depending on available columns
    user_col = 'user_id'
    msg_col = 'message'
    created_col = None

    try:
        c_chk = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        c_chk.execute("SHOW COLUMNS FROM GROUP_MESSAGES")
        rows = c_chk.fetchall()
        existing = [r.get('Field', r.get('COLUMN_NAME', '')).lower() for r in rows if r]
        c_chk.close()

        # detect user column
        if 'user_id' not in existing:
            for alt in ('userid', 'sender_id', 'senderid', 'user'):
                if alt in existing:
                    user_col = alt
                    break
        # detect message column
        if 'message' not in existing:
            for alt in ('msg', 'text', 'body'):
                if alt in existing:
                    msg_col = alt
                    break
        # detect created/timestamp column; prefer created_at
        for cand in ('created_at', 'created', 'timestamp', 'createdon'):
            if cand in existing:
                created_col = cand
                break
        # fallback to id if no timestamp column exists
        if created_col is None:
            created_col = 'id'
    except Exception:
        created_col = 'id'

    select_sql = f"SELECT M.id, M.group_id, M.{user_col} AS user_id, M.{msg_col} AS message, M.{created_col} AS created_at, U.NAME AS sender_name FROM GROUP_MESSAGES M JOIN REGISTRATION U ON M.{user_col} = U.ID WHERE M.group_id = %s ORDER BY M.{created_col} ASC"
    try:
        cursor.execute(select_sql, (group_id,))
    except Exception as e:
        cursor.close()
        return jsonify({'message': 'Failed to query messages', 'error': str(e), 'sql': select_sql}), 500
    rows = cursor.fetchall()
    cursor.close()

    msgs = []
    for r in rows:
        msgs.append({
            'id': r['id'],
            'group_id': r['group_id'],
            'user_id': r['user_id'],
            'message': r['message'],
            'created_at': str(r['created_at']),
            'sender_name': r.get('sender_name')
        })

    return jsonify({'messages': msgs}), 200


@group_bp.route('/messages', methods=['POST'])
def post_group_message():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    data = request.json or {}
    group_id = data.get('group_id')
    message = data.get('message')
    if not group_id or not message:
        return jsonify({'message': 'group_id and message required'}), 400

    user_id = session['user_id']
    cursor = mysql.connection.cursor()

    # verify membership
    cursor.execute("SELECT 1 FROM GROUP_MEMBERS WHERE group_id=%s AND user_id=%s", (group_id, user_id))
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'message': 'Not a member of this group'}), 403

    # determine actual column names and insert accordingly
    try:
        c_chk = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        c_chk.execute("SHOW COLUMNS FROM GROUP_MESSAGES")
        rows = c_chk.fetchall()
        existing = [r.get('Field', r.get('COLUMN_NAME', '')).lower() for r in rows if r]
        c_chk.close()
    except Exception:
        existing = []

    # detect appropriate insert column names (prefer sender_id to satisfy NOT NULL in common schemas)
    insert_user_col = None
    for alt in ('sender_id', 'user_id', 'userid', 'senderid', 'user'):
        if alt in existing:
            insert_user_col = alt
            break

    insert_msg_col = None
    for alt in ('message', 'msg', 'text', 'body'):
        if alt in existing:
            insert_msg_col = alt
            break

    if not insert_user_col or not insert_msg_col:
        cursor.close()
        return jsonify({'message': 'Database schema for GROUP_MESSAGES is incompatible. Requires either user_id/sender_id and message/msg columns.', 'columns_detected': existing}), 500

    try:
        sql = f"INSERT INTO GROUP_MESSAGES (group_id, {insert_user_col}, {insert_msg_col}) VALUES (%s, %s, %s)"
        cursor.execute(sql, (group_id, user_id, message))
        mysql.connection.commit()
        msg_id = cursor.lastrowid
    except Exception as e:
        cursor.close()
        return jsonify({'message': 'Failed to store message', 'error': str(e)}), 500

    cursor.close()

    return jsonify({'message': 'Message sent', 'id': msg_id}), 201


@group_bp.route('/debug_columns', methods=['GET'])
def debug_group_messages_columns():
    """Development helper: return SHOW COLUMNS and SHOW CREATE TABLE for GROUP_MESSAGES."""
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    try:
        c = mysql.connection.cursor()
        c.execute('SHOW COLUMNS FROM GROUP_MESSAGES')
        cols = c.fetchall()
        c.execute('SHOW CREATE TABLE GROUP_MESSAGES')
        create = c.fetchall()
        c.close()
        return jsonify({'columns': cols, 'create': create}), 200
    except Exception as e:
        try:
            c.close()
        except Exception:
            pass
        return jsonify({'message': 'Failed to inspect GROUP_MESSAGES', 'error': str(e)}), 500

