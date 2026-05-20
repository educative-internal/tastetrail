import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)

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
    app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

    project_root = Path(__file__).resolve().parent.parent
    upload_folder = project_root / "uploads"
    upload_folder.mkdir(parents=True, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = str(upload_folder)

    db.init_app(app)

    from app import models  # noqa: F401
    from app import routes

    app.register_blueprint(routes.bp)

    with app.app_context():
        db.create_all()

    return app
