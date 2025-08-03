# Makefile for FastAPI React MongoDB Project

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev          - Run both frontend and backend in development mode"
	@echo "  make frontend     - Run only the frontend (Next.js)"
	@echo "  make backend      - Run only the backend (FastAPI)"
	@echo "  make install      - Install dependencies for both frontend and backend"
	@echo "  make clean        - Clean node_modules and __pycache__"
	@echo "  make build        - Build the frontend for production"
	@echo "  make start        - Start both frontend and backend in production mode"

# Development - run both frontend and backend
.PHONY: dev
dev:
	@echo "Starting both frontend and backend in development mode..."
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Backend will be available at: http://localhost:8000"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill %1 %2' SIGINT; \
	cd frontend && npm run dev & \
	cd backend && . venv/bin/activate && python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000 & \
	wait

# Run only frontend
.PHONY: frontend
frontend:
	@echo "Starting frontend development server..."
	@echo "Frontend will be available at: http://localhost:3000"
	cd frontend && npm run dev

# Run only backend
.PHONY: backend
backend:
	@echo "Starting backend development server..."
	@echo "Backend will be available at: http://localhost:8000"
	@echo "API documentation will be available at: http://localhost:8000/docs"
	cd backend && . venv/bin/activate && python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Install dependencies for both frontend and backend
.PHONY: install
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "All dependencies installed successfully!"

# Clean up generated files
.PHONY: clean
clean:
	@echo "Cleaning up..."
	@rm -rf frontend/node_modules
	@rm -rf frontend/.next
	@rm -rf backend/venv
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Cleanup completed!"

# Build frontend for production
.PHONY: build
build:
	@echo "Building frontend for production..."
	cd frontend && npm run build
	@echo "Frontend build completed!"

# Start both in production mode (requires build first)
.PHONY: start
start:
	@echo "Starting both frontend and backend in production mode..."
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Backend will be available at: http://localhost:8000"
	@trap 'kill %1 %2' SIGINT; \
	cd frontend && npm start & \
	cd backend && . venv/bin/activate && python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 & \
	wait

# Install backend dependencies only
.PHONY: install-backend
install-backend:
	@echo "Installing backend dependencies..."
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "Backend dependencies installed successfully!"

# Install frontend dependencies only
.PHONY: install-frontend
install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Frontend dependencies installed successfully!"

# Create virtual environment for backend
.PHONY: create-venv
create-venv:
	@echo "Creating virtual environment for backend..."
	cd backend && python3 -m venv venv
	@echo "Virtual environment created successfully!"

# Check if all dependencies are installed
.PHONY: check-deps
check-deps:
	@echo "Checking dependencies..."
	@if [ ! -d "frontend/node_modules" ]; then \
		echo "Frontend dependencies not installed. Run 'make install-frontend'"; \
		exit 1; \
	fi
	@if [ ! -d "backend/venv" ]; then \
		echo "Backend virtual environment not found. Run 'make install-backend'"; \
		exit 1; \
	fi
	@if [ ! -f "backend/requirements.txt" ]; then \
		echo "Backend requirements.txt not found"; \
		exit 1; \
	fi
	@echo "All dependencies are installed!" 