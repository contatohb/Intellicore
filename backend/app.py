import os, logging, importlib, pkgutil
from flask import Flask, jsonify

def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/health")
    def health():
        # nunca depende de nada externo
        return jsonify(ok=True), 200

    # Registro tolerante a falhas
    if os.getenv("REGISTER_BLUEPRINTS", "1") == "1":
        try:
            register_blueprints(app)
        except Exception as e:
            logging.exception("Blueprint bootstrap non-fatal: %s", e)
    return app

def register_blueprints(app: Flask):
    from backend import routes  # pacote com as rotas
    for _, name, _ in pkgutil.iter_modules(routes.__path__):
        if name.startswith("_") or name == "health":
            continue
        mod = importlib.import_module(f"backend.routes.{name}")
        bp = getattr(mod, "bp", None) or getattr(mod, f"{name}_api", None)
        if bp is None:
            logging.warning("Skipping %s: no blueprint named 'bp' or '%s_api'", name, name)
            continue
        app.register_blueprint(bp)
        logging.info("Registered blueprint: %s", name)

app = create_app()
