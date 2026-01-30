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
    data = request.json
    email = data['email']
    password = data['password']

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM REGISTRATION WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()

    try:
        if not user:
            return jsonify({"status": "error", "message": "Invalid email or password"}), 401

        # Handle varying column name casing between environments
        stored_hash = user.get('PASSWORD') or user.get('password')
        if not stored_hash:
            print("[AUTH] Missing password column in REGISTRATION row keys:", list(user.keys()))
            return jsonify({"status": "error", "message": "Server configuration error: password column missing"}), 500

        if not check_password_hash(stored_hash, password):
            return jsonify({"status": "error", "message": "Invalid email or password"}), 401

        uid = user.get('ID') or user.get('id')
        uname = user.get('NAME') or user.get('name')
        uemail = user.get('EMAIL') or user.get('email')
        uschool = user.get('SCHOOL') or user.get('school')
        uskills = user.get('SKILLS') or user.get('skills')
        uinterest = user.get('INTEREST') or user.get('interest')

        session['user_id'] = uid
        session['user_name'] = uname

        payload = {
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": uid,
                "name": uname,
                "email": uemail,
                "school": uschool,
                "skills": uskills,
                "interest": uinterest
            }
        }

        try:
            print("[AUTH] session after login:", dict(session))
        except Exception:
            print("[AUTH] session debug failed")

        resp = make_response(jsonify(payload))
        return resp
    except Exception as e:
        print("[AUTH] Login failed:", str(e))
        return jsonify({"status": "error", "message": "Server error during login"}), 500


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
