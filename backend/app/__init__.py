from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

def create_app():
    # Load environment variables from .env file
    load_dotenv()
    
    app = Flask(__name__)
    CORS(app)
    
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app 