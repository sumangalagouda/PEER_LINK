from flask import Blueprint, request, jsonify, session, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import MySQLdb.cursors
from extensions import mysql

auth_bp = Blueprint('auth', __name__)

# mysql = init_db(app)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data['name']
    email = data['email']
    school = data.get('school', '')
    skills = data.get('skills', '')
    interest = data.get('interest', '')
    password = data['password']

    pass_hash=generate_password_hash(password)
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    # Check if email already exists
    cursor.execute("SELECT * FROM REGISTRATION WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        
        return jsonify({'message': 'Email already registered'}), 400


    cursor.execute("""
        INSERT INTO REGISTRATION (NAME, EMAIL, SCHOOL, SKILLS, INTEREST, PASSWORD)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (name, email, school, skills, interest, pass_hash))

    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'User registered successfully!'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM REGISTRATION WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
    except Exception as e:
        print("[LOGIN DB ERROR]", e)
        return jsonify({"message": "Database unavailable"}), 500

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    stored = user.get("PASSWORD") or user.get("password")
    if not stored:
        return jsonify({"message": "Password missing"}), 500

    try:
        if not check_password_hash(stored, password):
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        print("[HASH ERROR]", e)
        return jsonify({"message": "Auth error"}), 500

    session["user_id"] = user.get("ID") or user.get("id")
    session["user_name"] = user.get("NAME") or user.get("name")

    return jsonify({
        "status": "success",
        "user": {
            "id": session["user_id"],
            "name": session["user_name"],
            "email": user.get("EMAIL") or user.get("email")
        }
    })


@auth_bp.route('/status', methods=['GET'])
def status():
    if 'user_id' in session:
        return jsonify({
            'logged_in': True,
            'user_id': session['user_id'],
            'user_name': session['user_name']
        })
    else:
        return jsonify({'logged_in':False})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logged out successfully"})

@app.route("/db-test")
def db_test():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT 1")
        return {"status": "DB CONNECTED"}
    except Exception as e:
        return {"error": str(e)}, 500
