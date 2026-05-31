#!/usr/bin/env python3
"""
シナリオ管理ページ用Pythonサーバー
ブラウザで http://localhost:8000 にアクセスしてください
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # キャッシュ制御ヘッダーを追加
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

def run_server():
    """サーバーを起動"""
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"✅ サーバーが起動しました")
            print(f"📍 ブラウザで以下にアクセスしてください:")
            print(f"   http://localhost:{PORT}")
            print(f"   http://127.0.0.1:{PORT}")
            print(f"\n📁 提供ディレクトリ: {DIRECTORY}")
            print(f"\n⏹️  サーバーを停止するには Ctrl+C を押してください\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✋ サーバーを停止しました")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ エラー: ポート {PORT} は既に使用されています")
            print(f"別のプロセスを確認するか、別のポートを使用してください")
        else:
            print(f"❌ エラー: {e}")

if __name__ == '__main__':
    run_server()
