import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from supabase import create_client, Client

# === Inicialização ===
load_dotenv()

app = Flask(__name__)

# === Conexão com Supabase ===
SUPABASE_URL = os.getenv("https://wuadkgmggkmyglxpxeyh.supabase.co")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1YWRrZ21nZ2tteWdseHB4ZXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk1NzU4NywiZXhwIjoyMDc2NTMzNTg3fQ.Qroz39JExkH4tXofSIqzZMQNtQDAv5rPSR_OJdeH4FI")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Rotas ===
from backend.routes.log_event import log_api
from backend.routes.bulletin import bulletin_api
from backend.routes.test_db import test_db_api

# Registrar blueprints
app.register_blueprint(log_api, url_prefix="/log")
app.register_blueprint(bulletin_api, url_prefix="/bulletin")
app.register_blueprint(test_db_api, url_prefix="/test")

# === Health check ===
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# === Execução local ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
