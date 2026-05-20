import uuid
from pathlib import Path

from flask import (
    Blueprint,
    abort,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.utils import secure_filename

from app import db
from app.models import Comment, Like, Post

bp = Blueprint("main", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def get_visitor_id():
    if "visitor_id" not in session:
        session["visitor_id"] = uuid.uuid4().hex
    return session["visitor_id"]


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_upload(file):
    if not file or file.filename == "":
        return None
    if not allowed_file(file.filename):
        return None

    original = secure_filename(file.filename)
    extension = original.rsplit(".", 1)[1].lower()
    stored_name = f"{uuid.uuid4().hex}.{extension}"
    upload_dir = Path(current_app.config["UPLOAD_FOLDER"])
    upload_dir.mkdir(parents=True, exist_ok=True)
    file.save(upload_dir / stored_name)
    return stored_name


@bp.route("/")
def index():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    visitor_id = get_visitor_id()
    liked_post_ids = {
        row.post_id
        for row in Like.query.filter_by(visitor_id=visitor_id).all()
    }
    return render_template(
        "index.html",
        posts=posts,
        liked_post_ids=liked_post_ids,
    )


@bp.route("/uploads/<path:filename>")
def uploaded_file(filename):
    safe_name = secure_filename(filename)
    if safe_name != filename:
        abort(404)
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], safe_name)


@bp.route("/posts", methods=["POST"])
def create_post():
    image = request.files.get("image")
    caption = (request.form.get("caption") or "").strip()

    if not image or image.filename == "":
        flash("Choose an image to create a post.", "error")
        return redirect(url_for("main.index"))

    if not allowed_file(image.filename):
        flash("Use a PNG, JPG, GIF, or WebP image.", "error")
        return redirect(url_for("main.index"))

    stored_name = save_upload(image)
    if not stored_name:
        flash("Could not save that image. Try again.", "error")
        return redirect(url_for("main.index"))

    post = Post(image_filename=stored_name, caption=caption)
    db.session.add(post)
    db.session.commit()
    flash("Post shared to the feed.", "success")
    return redirect(url_for("main.index"))


@bp.route("/posts/<int:post_id>/delete", methods=["POST"])
def delete_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        abort(404)

    image_path = Path(current_app.config["UPLOAD_FOLDER"]) / post.image_filename
    db.session.delete(post)
    db.session.commit()

    if image_path.is_file():
        image_path.unlink()

    flash("Post removed from the feed.", "success")
    return redirect(url_for("main.index"))


@bp.route("/posts/<int:post_id>/like", methods=["POST"])
def toggle_like(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        abort(404)

    visitor_id = get_visitor_id()
    existing = Like.query.filter_by(
        post_id=post.id,
        visitor_id=visitor_id,
    ).first()

    if existing:
        db.session.delete(existing)
    else:
        db.session.add(Like(post_id=post.id, visitor_id=visitor_id))

    db.session.commit()
    return redirect(url_for("main.index"))


@bp.route("/posts/<int:post_id>/comments", methods=["POST"])
def add_comment(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        abort(404)

    body = (request.form.get("body") or "").strip()
    if not body:
        flash("Write a comment before posting.", "error")
        return redirect(url_for("main.index"))

    db.session.add(Comment(post_id=post.id, body=body))
    db.session.commit()
    return redirect(url_for("main.index", _anchor=f"post-{post.id}"))
