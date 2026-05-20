import uuid
from pathlib import Path
from urllib.parse import urlparse

from flask import (
    Blueprint,
    abort,
    current_app,
    flash,
    g,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename

from app import db
from app.auth import (
    find_user_for_login,
    get_like_key,
    get_visitor_id,
    login_required,
    login_user,
    logout_user,
    validate_signup,
)
from app.models import Comment, Like, Post, User

bp = Blueprint("main", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def is_safe_redirect(target):
    if not target:
        return False
    host_url = urlparse(request.host_url)
    redirect_url = urlparse(target)
    return (
        redirect_url.scheme in ("http", "https")
        and redirect_url.netloc == host_url.netloc
    )


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
    get_visitor_id()
    posts = (
        Post.query.options(
            joinedload(Post.author),
            joinedload(Post.comments).joinedload(Comment.author),
        )
        .order_by(Post.created_at.desc())
        .all()
    )
    like_key = get_like_key()
    liked_post_ids = {
        row.post_id
        for row in Like.query.filter_by(visitor_id=like_key).all()
    }
    return render_template(
        "index.html",
        posts=posts,
        liked_post_ids=liked_post_ids,
    )


@bp.route("/signup", methods=["GET", "POST"])
def signup():
    if g.user is not None:
        return redirect(url_for("main.index"))

    if request.method == "POST":
        data, error = validate_signup(
            request.form.get("username"),
            request.form.get("email"),
            request.form.get("password"),
            request.form.get("confirm_password"),
        )
        if error:
            flash(error, "error")
            return render_template(
                "signup.html",
                username=request.form.get("username", "").strip(),
                email=request.form.get("email", "").strip(),
            )

        user = User(username=data["username"], email=data["email"])
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash(f"Welcome to InstaLite, {user.username}.", "success")
        return redirect(url_for("main.index"))

    return render_template("signup.html")


@bp.route("/login", methods=["GET", "POST"])
def login():
    if g.user is not None:
        return redirect(url_for("main.index"))

    next_url = request.args.get("next") or request.form.get("next") or ""

    if request.method == "POST":
        user, error = find_user_for_login(
            request.form.get("identifier"),
            request.form.get("password"),
        )
        if error:
            flash(error, "error")
            return render_template("login.html", next=next_url)

        login_user(user)
        flash(f"Signed in as {user.username}.", "success")
        if is_safe_redirect(next_url):
            return redirect(next_url)
        return redirect(url_for("main.index"))

    return render_template("login.html", next=next_url)


@bp.route("/logout", methods=["POST"])
def logout():
    if g.user is not None:
        flash("You have been signed out.", "success")
    logout_user()
    return redirect(url_for("main.index"))


@bp.route("/uploads/<path:filename>")
def uploaded_file(filename):
    safe_name = secure_filename(filename)
    if safe_name != filename:
        abort(404)
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], safe_name)


@bp.route("/posts", methods=["POST"])
@login_required
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

    post = Post(
        user_id=g.user.id,
        image_filename=stored_name,
        caption=caption,
    )
    db.session.add(post)
    db.session.commit()
    flash("Post shared to the feed.", "success")
    return redirect(url_for("main.index"))


@bp.route("/posts/<int:post_id>/delete", methods=["POST"])
@login_required
def delete_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        abort(404)

    if post.user_id != g.user.id:
        flash("You can only delete your own posts.", "error")
        return redirect(url_for("main.index"))

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

    like_key = get_like_key()
    existing = Like.query.filter_by(
        post_id=post.id,
        visitor_id=like_key,
    ).first()

    if existing:
        db.session.delete(existing)
    else:
        db.session.add(Like(post_id=post.id, visitor_id=like_key))

    db.session.commit()
    return redirect(url_for("main.index"))


@bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@login_required
def add_comment(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        abort(404)

    body = (request.form.get("body") or "").strip()
    if not body:
        flash("Write a comment before posting.", "error")
        return redirect(url_for("main.index"))

    db.session.add(
        Comment(
            post_id=post.id,
            user_id=g.user.id,
            body=body,
        )
    )
    db.session.commit()
    return redirect(url_for("main.index", _anchor=f"post-{post.id}"))
