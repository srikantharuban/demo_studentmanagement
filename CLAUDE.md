# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands assume the virtualenv is activated (`venv\Scripts\activate` on Windows, `source venv/bin/activate` on macOS/Linux), or that you prefix with `venv\Scripts\python -m` / `venv/bin/python -m`.

**Run the server:**
```bash
uvicorn app.main:app --reload --port 8000
```

**Seed sample data** (5 students, 4 courses, 11 enrollments, 20 attendance records, 12 grades — safe to re-run):
```bash
python seed.py
```

**Run all tests:**
```bash
pytest
```

**Run a single test file:**
```bash
pytest tests/test_students.py -v
```

**Run a single test:**
```bash
pytest tests/test_grades.py::test_average_single_course -v
```

## Architecture

This is a FastAPI + SQLAlchemy + SQLite REST API. The database file (`students.db`) is created automatically on first startup via `Base.metadata.create_all` in `app/main.py`'s startup event.

### Request flow

```
HTTP request → app/main.py (router registration)
             → app/routers/<resource>.py (route handler)
             → app/database.py get_db() dependency (SQLAlchemy session)
             → app/models.py (ORM queries)
             ← app/schemas.py (Pydantic response serialisation)
```

### Key design decisions

**Schemas follow a Create / Update / Response triple pattern.** `Create` schemas have all required fields. `Update` schemas make every field `Optional` (used for PATCH). `PUT` reuses the `Create` schema (full replacement). `Response` schemas set `model_config = ConfigDict(from_attributes=True)` to serialise directly from SQLAlchemy ORM objects.

**409 conflicts are caught via `IntegrityError`.** Unique constraint violations (duplicate email, duplicate course code, duplicate enrollment, duplicate attendance per student/course/date) are caught at the SQLAlchemy commit level and re-raised as `HTTPException(409)`. Do not add application-level pre-checks — catch `IntegrityError` and rollback instead.

**`/grades/average` must be registered before `/{grade_id}`.** FastAPI resolves literal path segments before parameterised ones only within the same router registration order. The comment in `app/routers/grades.py` documents this — preserve the ordering.

**Cascade deletes are handled at the ORM level.** All child relationships (enrollments, attendance, grades) on `Student` and `Course` use `cascade="all, delete-orphan"`. Foreign keys also have `ondelete="CASCADE"` for direct SQL deletes.

**Static frontend is mounted at `/ui/`.** `app/main.py` mounts `static/` as a `StaticFiles` directory at `/ui`. The root `/` redirects there. The frontend is a vanilla JS SPA that calls the REST API directly.

### Test isolation

`tests/conftest.py` uses an in-memory SQLite database with `StaticPool` and an `autouse` fixture that drops and recreates all tables before every test. Tests receive a `client` fixture that overrides the `get_db` dependency with a session bound to the in-memory engine. `students.db` is never touched by tests.
