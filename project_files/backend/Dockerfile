FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc && \
    rm -rf /var/lib/apt/lists/*

COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Flask port
EXPOSE 5000

# Start app
CMD ["python", "app.py"]
