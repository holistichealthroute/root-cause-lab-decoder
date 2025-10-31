FROM python:3.11-slim

# Install compiler & YAML headers for PyYAML 6.0 build
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc libyaml-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
