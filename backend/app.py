from flask import Flask, jsonify
import os
from routes.test_db import test_db
from routes.log_event import log_api
from logger import log_event

app = Flask(__name__)
app.register_blueprint(test_db)
app.register_blueprint(log_api)

@app.route("/")
def home():
    log_event("system", "ping", "home")
    return jsonify({
        "project": "Intellicore",
        "status": "running",
        "modules": ["RegIntel 2.0", "RegIntel 2.1"]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
