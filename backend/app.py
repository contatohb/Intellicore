from flask import Flask, jsonify

from backend.routes import register_blueprints


def create_app() -> Flask:
    app = Flask(__name__)
    register_blueprints(app)

    @app.route("/")
    def index():
        return jsonify({"status": "Backend online", "version": "1.0.0"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
