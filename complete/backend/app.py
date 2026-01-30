from flask import Flask
from db_config import init_db
from flask_cors import CORS
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecret")

# Configure cookies based on environment (prod requires cross-site over HTTPS)
is_render = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_URL"))
is_prod_flag = os.getenv("ENV") == "production"
if is_render or is_prod_flag:
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True
else:
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True

app.permanent_session_lifetime = timedelta(days=7)


# Allow local dev and deployed frontend origins
frontend_origin = os.getenv("FRONTEND_ORIGIN", "https://peer-link-2.onrender.com")
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                frontend_origin
            ]
        }
    },
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
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