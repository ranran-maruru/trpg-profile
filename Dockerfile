FROM python:3.11-slim

WORKDIR /app

# ファイルをコピー
COPY pages/ ./pages/
COPY data/ ./data/
COPY server.py .

# ポート8000を公開
EXPOSE 8000

# サーバーを起動
CMD ["python3", "server.py"]
