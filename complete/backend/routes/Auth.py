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
        INSERT INTO REGISTRATION (name, email, school, skills, interest, password)
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

    if user and check_password_hash(user['PASSWORD'], password):

        session['user_id'] = user['ID']
        session['user_name'] = user['NAME']

        # Build response explicitly so we can ensure Flask sets the session cookie
        payload = {
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": user["ID"],
                "name": user["NAME"],
                "email": user["EMAIL"],
                "school": user["SCHOOL"],
                "skills": user["SKILLS"],
                "interest": user["INTEREST"]
            }
        }

        # Debug: print session state to server logs
        try:
            print("[AUTH] session after login:", dict(session))
        except Exception:
            print("[AUTH] session debug failed")

        resp = make_response(jsonify(payload))
        # return response — Flask should attach the session cookie automatically
        return resp
    
    return jsonify({"status": "error", "message": "Invalid email or password"}), 401


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
