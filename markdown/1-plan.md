
---

**User**

We are starting a new project called InstaLite in an empty folder.

Project overview:
InstaLite is a small Instagram style web app for practice. The app is for people who want to share simple image posts with captions in a clean social feed. In this project, we want to build a small but polished social app step by step using Cursor.

Stack:
- Flask
- SQLAlchemy

For now, do not start writing the full app yet.

Help me plan the project setup and the first build step clearly.

Please do these things:
1. Briefly restate the project in your own words so we are aligned.
2. Tell me exactly what dependencies, tools, and setup steps we need before coding.
3. Keep the plan focused only on getting ready to build the app.


---

**Cursor**

Checking the workspace so our setup plan matches what's already there.


The project folder is empty, so this is a greenfield setup plan only—no app code yet.

## 1. What we are building (aligned)

**InstaLite** is a small, practice focused social web app: people can post images with short captions, and everyone sees those posts in a simple, clean feed—like a lightweight Instagram. The goal is a **polished but small** product built **incrementally in Cursor**, using **Flask** for the web layer and **SQLAlchemy** for data (users, posts, captions, and related records). We are not aiming for production scale auth, stories, DMs, or algorithms—just a clear feed, posting flow, and tidy UI.

---

## 2. What we need before writing app features

### Runtime and tooling

| Item | Purpose |
|------|--------|
| **Python 3.11 or 3.12** | Stable, well supported for Flask |
| **`python3 -m venv`** | Isolated dependencies per project |
| **pip** (inside the venv) | Install packages |
| **Git** | Version control from day one |
| **Cursor** | Editor and agent for step by step builds |

Optional but useful later (not required for day one):

- **DB Browser for SQLite** or similar, to inspect the local database
- **curl** or the browser, to hit routes while developing

### Python packages (initial `requirements.txt`)

Core (install these first):

| Package | Role |
|---------|------|
| **Flask** | Web app, routes, templates, static files |
| **Flask-SQLAlchemy** | Flask integration for SQLAlchemy (models, sessions) |
| **python-dotenv** | Load config from `.env` without hardcoding secrets |

Recommended for the first real features (can add when we reach uploads):

| Package | Role |
|---------|------|
| **Pillow** | Validate and optionally resize uploaded images |

Add when we introduce schema changes in a repeatable way:

| Package | Role |
|---------|------|
| **Flask-Migrate** | Alembic based migrations on top of SQLAlchemy |

Dev / quality (optional until we have tests):

| Package | Role |
|---------|------|
| **pytest** | Automated tests |
| **pytest-flask** | Flask test client helpers |

Example starter pin set (versions can be updated when we scaffold):

```text
Flask>=3.0,<4
Flask-SQLAlchemy>=3.1,<4
python-dotenv>=1.0,<2
```

We will use **SQLite** for local practice (no separate database server). SQLAlchemy talks to it via a URL like `sqlite:///instance/instalite.db`.

### Config and secrets (before any routes)

Plan for:

- **`.env`** (local only): `FLASK_APP`, `FLASK_ENV=development`, `SECRET_KEY`, `DATABASE_URL`
- **`.env.example`**: same keys, placeholder values, committed to Git
- **`.gitignore`**: venv, `__pycache__`, `.env`, `instance/*.db`, `uploads/`, OS junk

### Folder layout (scaffold only, no business logic yet)

Agree on a simple layout so later steps stay predictable:

```text
project/
  app/
    __init__.py      # app factory, db init
    models.py        # empty until first model
    routes.py        # or blueprints later
    templates/
    static/
      css/
      img/
  instance/          # SQLite file (gitignored)
  uploads/           # user images (gitignored)
  .env
  .env.example
  .gitignore
  requirements.txt
  run.py             # entry: flask run or app.run
```

### Setup steps (do these in order)

1. **Confirm Python**  
   `python3 --version` (3.11+).

2. **Create and activate a virtual environment** (in the project root)  
   - `python3 -m venv .venv`  
   - macOS/Linux: `source .venv/bin/activate`  
   - Windows: `.venv\Scripts\activate`

3. **Create `requirements.txt`** with the core packages above.

4. **Install dependencies**  
   `pip install -r requirements.txt`

5. **Initialize Git**  
   `git init`, add `.gitignore`, first commit with only scaffold/config files (no secrets).

6. **Create `.env` from `.env.example`**  
   Generate a real `SECRET_KEY` (e.g. `python3 -c "import secrets; print(secrets.token_hex(32))"`).

7. **Create empty directories**  
   `app/templates`, `app/static/css`, `instance`, `uploads`.

8. **Minimal Flask shell (smoke test only)**  
   App factory, one route (e.g. health or “InstaLite”), `flask run` succeeds. No models, no feed, no uploads yet.

9. **Wire SQLAlchemy once**  
   In the app factory: `SQLALCHEMY_DATABASE_URI` from env, `db.init_app(app)`. No tables until the first model lesson.

10. **Document how we run the app**  
    One line in a short `README.md`: venv activate, `pip install`, `flask run`, URL `http://127.0.0.1:5000`.

That is the full “ready to build” bar: **venv, deps, env, Git, folder layout, Flask responds, database extension attached, nothing feature complete.**

---

## 3. First build step after setup (scope only)

Once the smoke test passes, **first real build step** should be small and verifiable:

**Define the `Post` model and create the database.**

- Fields to plan: primary key, image path or filename, caption text, created timestamp (and later `user_id` if we add users in step 2).
- Run `db.create_all()` in dev (or first migration if we add Flask-Migrate now).
- Confirm the table exists in SQLite.

We stop there before templates, feed UI, or upload forms—so the next session is “data layer works,” not “full Instagram.”

---

### Quick checklist before feature work

- [ ] Python 3.11+ and venv active  
- [ ] `requirements.txt` installed  
- [ ] `.env` + `.gitignore` in place  
- [ ] Folder layout created  
- [ ] `flask run` shows a placeholder page  
- [ ] SQLAlchemy initialized, DB URI points at `instance/`  
- [ ] Git repo with no secrets committed  

When you want to proceed, we can execute this scaffold in the empty folder (venv, files, smoke route) without building the feed yet.

---
