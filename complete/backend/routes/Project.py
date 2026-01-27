from flask import Blueprint, request, jsonify, session
from db_config import mysql

project_bp = Blueprint('project_bp', __name__)


@project_bp.route('/create', methods=['POST'])
def create_project():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    data = request.json or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    mode = (data.get('mode') or 'individual').strip().lower()
    group_id = data.get('group_id')
    created_by = session['user_id']

    if not title:
        return jsonify({'message': 'title is required'}), 400
    if mode not in ('individual', 'group'):
        return jsonify({'message': "mode must be 'individual' or 'group'"}), 400

    try:
        cur = mysql.connection.cursor()
        sql = (
            "INSERT INTO PROJECTS (title, description, mode, group_id, created_by) "
            "VALUES (%s, %s, %s, %s, %s)"
        )
        cur.execute(sql, (title, description, mode, group_id, created_by))
        mysql.connection.commit()
        project_id = cur.lastrowid
        cur.close()
        return jsonify({'message': 'Project created', 'project_id': project_id}), 201
    except Exception as e:
        try:
            cur.close()
        except Exception:
            pass
        return jsonify({
            'message': 'Failed to create project',
            'error': str(e),
            'hint': (
                "Ensure PROJECTS table exists. Example:\n"
                "CREATE TABLE PROJECTS (\n"
                "  id INT AUTO_INCREMENT PRIMARY KEY,\n"
                "  title VARCHAR(255) NOT NULL,\n"
                "  description TEXT,\n"
                "  mode ENUM('individual','group') NOT NULL DEFAULT 'individual',\n"
                "  group_id INT NULL,\n"
                "  created_by INT NOT NULL,\n"
                "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
                "  FOREIGN KEY (group_id) REFERENCES STDGROUP(id),\n"
                "  FOREIGN KEY (created_by) REFERENCES REGISTRATION(ID)\n"
                ")"
            )
        }), 500


@project_bp.route('/add_member', methods=['POST'])
def add_project_member():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    data = request.json or {}
    project_id = data.get('project_id')
    user_id = data.get('user_id')
    if not project_id or not user_id:
        return jsonify({'message': 'project_id and user_id required'}), 400

    current = session['user_id']

    try:
        # Enforce: only add accepted connections with current user
        c = mysql.connection.cursor()
        try:
            c.execute(
                """
                SELECT 1 FROM CONNECTIONS
                WHERE ((user_id=%s AND connected_user_id=%s) OR (user_id=%s AND connected_user_id=%s))
                  AND status='accepted'
                LIMIT 1
                """,
                (current, user_id, user_id, current)
            )
            ok = c.fetchone()
        except Exception:
            # Fallback without status column
            c.execute(
                """
                SELECT 1 FROM CONNECTIONS
                WHERE (user_id=%s AND connected_user_id=%s) OR (user_id=%s AND connected_user_id=%s)
                LIMIT 1
                """,
                (current, user_id, user_id, current)
            )
            ok = c.fetchone()
        if not ok:
            c.close()
            return jsonify({'message': 'You can only add connected (accepted) users to a project'}), 403

        # Add member (unique by project_id, user_id)
        sql = (
            "INSERT INTO PROJECT_MEMBERS (project_id, user_id) VALUES (%s, %s)"
        )
        c.execute(sql, (project_id, user_id))
        mysql.connection.commit()
        c.close()
        return jsonify({'message': 'Member added'}), 200
    except Exception as e:
        try:
            c.close()
        except Exception:
            pass
        return jsonify({
            'message': 'Failed to add project member',
            'error': str(e),
            'hint': (
                "Ensure PROJECT_MEMBERS exists. Example:\n"
                "CREATE TABLE PROJECT_MEMBERS (\n"
                "  id INT AUTO_INCREMENT PRIMARY KEY,\n"
                "  project_id INT NOT NULL,\n"
                "  user_id INT NOT NULL,\n"
                "  role VARCHAR(100),\n"
                "  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
                "  UNIQUE KEY uniq_project_member (project_id, user_id),\n"
                "  FOREIGN KEY (project_id) REFERENCES PROJECTS(id),\n"
                "  FOREIGN KEY (user_id) REFERENCES REGISTRATION(ID)\n"
                ")"
            )
        }), 500
