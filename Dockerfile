FROM python:3.11-slim

# Set the working directory to /app
WORKDIR /app

# Copy only the backend folder into the container
COPY backend/ /app/backend/

# Move into the backend folder for all future commands
WORKDIR /app/backend

# Install the necessary system dependencies for psycopg2 and python
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the database migrations during the build phase
# (We use || true in case the DB connection var isn't set during the exact build second)
RUN alembic upgrade head || true

# Expose the port Railway expects
EXPOSE $PORT

# Start the FastAPI server using Uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
