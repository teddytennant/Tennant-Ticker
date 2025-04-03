import sys
import os

# Add the current directory to Python's path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=3002) 