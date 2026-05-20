# InstaLite

A small Instagram style web app for practice. Built with Flask and SQLAlchemy.

## Setup

1. Create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy environment variables and set a secret key:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and replace `SECRET_KEY` with a long random string.

4. Run the app:

   ```bash
   flask run
   ```

   Open http://127.0.0.1:5000 in a browser.

## Project layout

- `app/` — application package (routes, models, templates, static files)
- `instance/` — SQLite database file (created at runtime)
- `uploads/` — user uploaded images (future use)
