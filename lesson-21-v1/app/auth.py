import re
import uuid
from functools import wraps

from flask import flash, g, redirect, request, session, url_for

from app import db
from app.models import User

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def load_logged_in_user():
    user_id = session.get("user_id")
    if user_id is None:
        g.user = None
        return
    g.user = db.session.get(User, user_id)


def login_user(user):
    session.clear()
    session.permanent = True
    session["user_id"] = user.id


def logout_user():
    session.clear()


def get_visitor_id():
    if "visitor_id" not in session:
        session["visitor_id"] = uuid.uuid4().hex
    return session["visitor_id"]


def get_like_key():
    if g.user is not None:
        return f"user:{g.user.id}"
    return get_visitor_id()


def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            flash("Sign in to continue.", "error")
            next_url = request.url
            return redirect(url_for("main.login", next=next_url))
        return view(**kwargs)

    return wrapped_view


def validate_signup(username, email, password, confirm_password):
    username = (username or "").strip()
    email = (email or "").strip().lower()
    password = password or ""
    confirm_password = confirm_password or ""

    if not USERNAME_PATTERN.match(username):
        return (
            None,
            "Username must be 3 to 30 characters and use letters, numbers, or underscores.",
        )

    if not EMAIL_PATTERN.match(email):
        return None, "Enter a valid email address."

    if len(password) < 8:
        return None, "Password must be at least 8 characters."

    if password != confirm_password:
        return None, "Passwords do not match."

    if User.query.filter_by(username=username).first():
        return None, "That username is already taken."

    if User.query.filter_by(email=email).first():
        return None, "That email is already registered."

    return {"username": username, "email": email, "password": password}, None


def find_user_for_login(identifier, password):
    identifier = (identifier or "").strip()
    password = password or ""

    if not identifier or not password:
        return None, "Enter your username or email and password."

    if "@" in identifier:
        user = User.query.filter_by(email=identifier.lower()).first()
    else:
        user = User.query.filter_by(username=identifier).first()

    if user is None or not user.check_password(password):
        return None, "Invalid username, email, or password."

    return user, None
