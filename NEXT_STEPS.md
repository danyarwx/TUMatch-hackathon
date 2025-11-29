# Next Steps: Connecting Backend to Frontend

## Summary

Your database compatibility check revealed **8 field naming mismatches** and **2 missing tables** between your FastAPI backend and React frontend. I've created updated files to fix everything.

## What I Created

### 1. **COMPATIBILITY_REPORT.md**
- Comprehensive analysis of all schema mismatches
- Detailed comparison tables
- SQL migration notes

### 2. **backend/models_updated.py**
- Fixed field names: `profile_photo` (not `avatar_url`), `location` (not `location_text`)
- Added missing fields: `department`, `bio`, `image_url`
- Added missing models: `Friendship`, `Moment`

### 3. **backend/schemas_updated.py**
- Updated Pydantic schemas matching the new models
- Added response schemas with frontend-compatible fields

### 4. **backend/main_updated.py**
- Complete REST API with all CRUD endpoints
- User, Event, Friendship, Moment operations
- CORS configured for localhost:5173
- Input validation and error handling

### 5. **MIGRATION_GUIDE.md**
- Step-by-step migration instructions
- SQL migration scripts
- Rollback procedures

## Quick Start

### Option A: Apply Changes Immediately

```bash
# 1. Backup your database
pg_dump tumatch_db > backup_$(date +%Y%m%d).sql

# 2. Replace backend files
cd /Users/yuki/GitRepos/TUMatch/backend
cp models_updated.py models.py
cp schemas_updated.py schemas.py
cp main_updated.py main.py

# 3. Create and apply migration
alembic revision --autogenerate -m "Update schema for frontend compatibility"
alembic upgrade head

# 4. Start backend server
uvicorn main:app --reload
```

### Option B: Review First, Apply Later

1. Read `COMPATIBILITY_REPORT.md` to understand all changes
2. Review `MIGRATION_GUIDE.md` for detailed steps
3. Test the migration in a development database first
4. Apply to production when ready

## Current State

### ✅ What's Working Now
- Frontend runs perfectly with mock localStorage data
- All pages navigate correctly (Feed, CreateEvent, EventDetails, Profile, UserProfile)
- Elegant hover animations on avatars
- Clickable organizer profiles
- Dev server on http://localhost:5173

### 🔄 What Needs Migration
- Backend database schema (field names, missing tables)
- API endpoints (currently only basic /events endpoint)
- Frontend API client (currently using localStorage instead of real API)

## After Migration

Once you apply the migration, you'll need to:

### 1. Update Frontend API Client

Replace the localStorage-based `api/base44Client.ts` with real API calls:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';

export async function getEvents() {
  const response = await fetch(`${API_BASE_URL}/events`);
  return response.json();
}

export async function createEvent(event: Event) {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return response.json();
}

// ... more functions
```

### 2. Test All Features

```bash
# Backend
curl http://localhost:8000/health
curl http://localhost:8000/api/events
curl http://localhost:8000/api/users

# Frontend
npm run dev
# Visit http://localhost:5173 and test:
# - Creating events
# - Joining events
# - Viewing profiles
# - Adding friends
# - Posting moments
```

### 3. Clear Old Mock Data

In browser console:
```javascript
localStorage.clear();
location.reload();
```

## File Structure After Migration

```
TUMatch/
├── backend/
│   ├── models.py           ← Updated with profile_photo, location, etc.
│   ├── schemas.py          ← Updated Pydantic schemas
│   ├── main.py             ← Complete REST API
│   ├── database.py         ← (unchanged)
│   └── alembic/
│       └── versions/
│           └── XXX_update_schema_for_frontend_compatibility.py
├── api/
│   └── base44Client.ts     ← TODO: Replace with real API calls
├── COMPATIBILITY_REPORT.md ← Read this first
├── MIGRATION_GUIDE.md      ← Follow this for migration
└── NEXT_STEPS.md          ← You are here!
```

## Important Notes

- **Backup first!** Always backup your database before migration
- **Test locally** before applying to production
- **Check dependencies** - Make sure you have all Python packages:
  ```bash
  pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic
  ```
- **UUID extension** - Ensure PostgreSQL has `uuid-ossp` extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

## Questions?

- How do I test the migration first? → Use a separate test database
- Can I rollback? → Yes, see MIGRATION_GUIDE.md "Rollback" section
- Do I need to recreate sample data? → Yes, after migration the database will be empty
- What about authentication? → Not yet implemented, add JWT tokens next

## Next Implementation Priorities

1. **Apply database migration** (highest priority - eliminates placeholder data)
2. **Replace frontend mock API** (connects to real backend)
3. **Add authentication** (JWT tokens, login/signup)
4. **Implement file uploads** (real image storage, not base64)
5. **Add real-time features** (WebSocket for notifications)

## Status

**You are ready to migrate!** All updated files are prepared and waiting in your backend directory.

Choose Option A to apply immediately or Option B to review first. 🚀
