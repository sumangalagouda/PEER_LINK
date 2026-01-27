from flask import Blueprint, request, jsonify, session
from db_config import mysql
import MySQLdb.cursors
from werkzeug.utils import secure_filename
import os

groupchat_bp = Blueprint('groupchat_bp', __name__)

UPLOAD_FOLDER = "uploads/group_chat"
ALLOWED = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


# ---------------- SEND MESSAGE ----------------
@groupchat_bp.route('/send', methods=['POST'])
def send_group_message():
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    sender_id = session['user_id']
    group_id = request.form.get('group_id')
    message = request.form.get('message', "")
    image = request.files.get('image')

    image_url = None

    cursor = mysql.connection.cursor()

    # Save image if present
    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        folder_path = UPLOAD_FOLDER
        os.makedirs(folder_path, exist_ok=True)
        filepath = os.path.join(folder_path, filename)
        image.save(filepath)
        image_url = f"/{filepath}"

    cursor.execute("""
        INSERT INTO GROUP_MESSAGES (group_id, sender_id, message, image_url)
        VALUES (%s, %s, %s, %s)
    """, (group_id, sender_id, message, image_url))

    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'Message sent'}), 201

@groupchat_bp.route('/history/<int:group_id>', methods=['GET'])
def group_chat_history(group_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Login required'}), 401

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""
        SELECT sender_id, message, image_url, timestamp
        FROM GROUP_MESSAGES
        WHERE group_id = %s
        ORDER BY timestamp ASC
    """, (group_id,))

    messages = cursor.fetchall()
    cursor.close()

    return jsonify({'messages': messages}), 200
