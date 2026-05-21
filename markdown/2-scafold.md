# InstaLite project setup planning

---

**User**

Okay, do the scaffold and install the core setup for me.

---

**Cursor**

Scaffolding the InstaLite project: creating the folder structure, core files, virtual environment, and dependencies.


Scaffold is in place and dependencies are installed. Here is what was created:

### Project layout

```text
project/
├── .env                 # local config (gitignored; SECRET_KEY set)
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── run.py
├── .venv/               # virtual environment with packages installed
├── app/
│   ├── __init__.py      # app factory + SQLAlchemy wired to instance/instalite.db
│   ├── routes.py        # home route
│   ├── models.py        # placeholder for next step
│   ├── templates/index.html
│   └── static/css/style.css
├── instance/            # SQLite will live here at runtime
└── uploads/             # ready for image uploads later
```

### Installed packages

Flask 3.1.3, Flask-SQLAlchemy 3.1.1, python-dotenv 1.2.2 (plus SQLAlchemy, Werkzeug, etc.)

### Verified

The app factory loads and `GET /` returns **200** with the InstaLite placeholder page.

### Run locally

```bash
cd /Users/maham/Desktop/vibe_coding-2/instalite/project
source .venv/bin/activate
flask run
```

Open http://127.0.0.1:5000

Git is initialized (no commit yet). `.env` is ignored so the secret key stays local.

**Next build step:** add the `Post` model and run `db.create_all()` when you are ready.

---
