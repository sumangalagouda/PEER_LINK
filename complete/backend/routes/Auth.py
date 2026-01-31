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

    stored = user.get('PASSWORD') or user.get('password')
    if stored is None:
        # No password column present in row
        return jsonify({"status": "error", "message": "Server configuration error: password column missing"}), 500

    is_hashed = isinstance(stored, str) and stored.startswith('pbkdf2:')
    ok = False
    try:
        if is_hashed:
            ok = check_password_hash(stored, password)
        else:
            # Legacy plaintext fallback (development/legacy data only)
            ok = stored == password
    except Exception:
        ok = False

    if not ok:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    uid = user.get('ID') or user.get('id')
    uname = user.get('NAME') or user.get('name')
    uemail = user.get('EMAIL') or user.get('email')
    uschool = user.get('SCHOOL') or user.get('school')
    uskills = user.get('SKILLS') or user.get('skills')
    uinterest = user.get('INTEREST') or user.get('interest')

    session['user_id'] = uid
    session['user_name'] = uname

    return jsonify({
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
