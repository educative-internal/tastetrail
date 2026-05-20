import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")
    database_url = os.environ.get(
        "DATABASE_URL",
        "sqlite:///instalite.db",
    )
    if database_url.startswith("sqlite:///") and not database_url.startswith(
        "sqlite:////"
    ):
        db_name = database_url.replace("sqlite:///", "")
        instance_path = Path(app.instance_path)
        instance_path.mkdir(parents=True, exist_ok=True)
        database_url = f"sqlite:///{instance_path / db_name}"

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from app import routes

    app.register_blueprint(routes.bp)

    return app
