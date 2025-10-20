from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "project": "Intellicore",
        "status": "running",
        "modules": ["RegIntel 2.0", "RegIntel 2.1"]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
