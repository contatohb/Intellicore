from flask import Flask, jsonify
from backend.routes import log_event, test_db, bulletin, ingest

app = Flask(__name__)

# Registrar Blueprints
app.register_blueprint(log_event.bp)
app.register_blueprint(test_db.bp)
app.register_blueprint(bulletin.bp)
app.register_blueprint(ingest.bp)

@app.route('/')
def index():
    return jsonify({"status": "Backend online", "version": "1.0.0"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
