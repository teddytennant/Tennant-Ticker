#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to display status messages
log() {
  echo -e "\033[1;34m[TennantTicker]\033[0m $1"
}

# Error handling
set -e
trap 'echo "Error occurred. Exiting... Error: $? - $BASH_COMMAND"; exit 1' ERR

# Check for Python 3
if ! command_exists python3; then
  log "Python 3 is not installed. Please install Python 3 and try again."
  exit 1
fi

# Check for pip3
if ! command_exists pip3; then
  log "pip3 is not installed. Please install pip3 and try again."
  exit 1
fi

# Check for Node.js and npm
if ! command_exists node; then
  log "Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

if ! command_exists npm; then
  log "npm is not installed. Please install npm and try again."
  exit 1
fi

# Stop any existing backend server forcefully
killall python3 || true

# Stop any process using port 3002
log "Checking for process on port 3002..."
lsof -ti tcp:3002 | xargs kill -9 > /dev/null 2>&1 || true

# Start the backend server
log "Starting backend server..."
cd backend
pwd

# Force removal of existing venv to ensure it's fresh
log "Removing existing backend virtual environment if present..."
rm -rf venv

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  log "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
  source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
  source venv/Scripts/activate
else
  log "Could not find activate script in venv. Creating a new environment..."
  rm -rf venv
  python3 -m venv venv
  if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
  elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
  else
    log "Failed to create a working virtual environment."
    exit 1
  fi
fi

# Install dependencies
log "Installing backend dependencies..."
pip3 install --break-system-packages -r ../requirements.txt

# Start the backend server in the background
log "Starting backend server on port 3002..."
python3 wsgi.py &
BACKEND_PID=$!

# Store the backend PID
echo $BACKEND_PID > .backend_pid

# Check if backend started successfully
sleep 5
if ! ps -p $BACKEND_PID > /dev/null; then
  log "Backend failed to start. Check the logs for errors."
  exit 1
fi

log "Backend server started with PID $BACKEND_PID"

# Stop any process using port 5174
# PID=$(lsof -ti tcp:5174)
# if [ -n "$PID" ]; then
#   kill -9 $PID || true
# fi

# Start the frontend server
cd ../frontend
log "Installing frontend dependencies..."
npm install

log "Starting frontend development server..."
npm run dev > frontend-dev.log 2>&1 &
FRONTEND_PID=$!

# Function to clean up background processes
cleanup() {
    log "Cleaning up..."
    if [ -f ../backend/.backend_pid ]; then
        BACKEND_PID_TO_KILL=$(cat ../backend/.backend_pid)
        log "Killing backend server (PID: $BACKEND_PID_TO_KILL)..."
        kill $BACKEND_PID_TO_KILL || log "Backend server already stopped."
        rm -f ../backend/.backend_pid
    else
        log "Backend PID file not found."
    fi

    log "Killing frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID || log "Frontend server already stopped."
    log "Cleanup finished."
}

# Trap signals to ensure cleanup runs
trap cleanup SIGINT SIGTERM EXIT

log "Frontend server started with PID $FRONTEND_PID"
log "Development environment is running. Press Ctrl+C to stop."

# Wait for the frontend process to exit
wait $FRONTEND_PID

# When the frontend server is terminated, kill the backend server
# pkill -P $$ -f "node server.js" # Old incorrect command
# rm -f ../backend/.backend_pid
# log "Backend server terminated." # Old incorrect log
