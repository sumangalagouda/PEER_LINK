from flask import Flask
from db_config import init_db
from flask_cors import CORS
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.secret_key='supersecret'


app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  
app.config["SESSION_COOKIE_HTTPONLY"] = True

app.permanent_session_lifetime = timedelta(days=7)


CORS(app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]}},
    supports_credentials=True
)


mysql = init_db(app)
print(os.getenv("DB_NAME"))

# Register blueprints
from routes.Auth import auth_bp
from routes.Profile import profile_bp
from routes.Connect import connect_bp
from routes.Group import group_bp
from routes.GroupChat import groupchat_bp
from routes.Project import project_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(profile_bp, url_prefix='/profile')
app.register_blueprint(connect_bp, url_prefix='/connect')
app.register_blueprint(group_bp, url_prefix='/group')
app.register_blueprint(groupchat_bp, url_prefix='/groupchat')
app.register_blueprint(project_bp, url_prefix='/project')

if __name__ == '__main__':
    app.run(debug=True, host="localhost", port=5000)