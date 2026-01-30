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
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM REGISTRATION WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    stored_hash = user.get('PASSWORD') or user.get('password')
    if not stored_hash:
        return jsonify({"status": "error", "message": "Password not set"}), 500

    if not check_password_hash(stored_hash, password):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    session['user_id'] = user.get('ID') or user.get('id')
    session['user_name'] = user.get('NAME') or user.get('name')

    return jsonify({
        "status": "success",
        "message": "Login successful"
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
