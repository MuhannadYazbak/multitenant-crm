# Use an official lightweight Python image
FROM python:3.13-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Copy dependency definition first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies without caching build artifacts
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application backend code into the container
COPY . .

# Expose port 8000 for Render
EXPOSE 8000

# Start FastAPI using uvicorn binding to 0.0.0.0 and port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]