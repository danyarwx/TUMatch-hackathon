# Migration Guide: Updating TUMatch Backend for Frontend Compatibility

## Step 1: Backup Current Database

```bash
pg_dump tumatch_db > backup_$(date +%Y%m%d).sql
```

## Step 2: Replace Backend Files

1. **Replace models.py**
   ```bash
   cp backend/models_updated.py backend/models.py
   ```

2. **Replace schemas.py**
   ```bash
   cp backend/schemas_updated.py backend/schemas.py
   ```

## Step 3: Create Alembic Migration

```bash
cd backend
alembic revision --autogenerate -m "Update schema for frontend compatibility"
```

Expected changes:
- Rename `users.avatar_url` → `users.profile_photo`
- Add `users.department` column
- Add `users.bio` column
- Rename `events.location_text` → `events.location`
- Add `events.image_url` column
- Create `friendships` table
- Create `moments` table

## Step 4: Review Migration File

Check `backend/alembic/versions/XXX_update_schema_for_frontend_compatibility.py`

Make sure it includes:

```python
def upgrade():
    # Users table updates
    op.alter_column('users', 'avatar_url', new_column_name='profile_photo')
    op.add_column('users', sa.Column('department', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))

    # Events table updates
    op.alter_column('events', 'location_text', new_column_name='location')
    op.add_column('events', sa.Column('image_url', sa.Text(), nullable=True))

    # Create friendships table
    op.create_table('friendships',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('friend_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Text(), server_default=sa.text("'pending'"), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['friend_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create moments table
    op.create_table('moments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('photo_url', sa.Text(), nullable=False),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('moments')
    op.drop_table('friendships')
    op.drop_column('events', 'image_url')
    op.alter_column('events', 'location', new_column_name='location_text')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'department')
    op.alter_column('users', 'profile_photo', new_column_name='avatar_url')
```

## Step 5: Apply Migration

```bash
alembic upgrade head
```

## Step 6: Verify Database Schema

```sql
-- Check users table
\d users

-- Check events table
\d events

-- Check new tables
\d friendships
\d moments
```

## Step 7: Update Frontend API Client

Replace `/Users/yuki/GitRepos/TUMatch/api/base44Client.ts` to use real API endpoints instead of localStorage.

## Step 8: Test API Endpoints

```bash
# Start backend
cd backend
uvicorn main:app --reload

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/events
curl http://localhost:8000/api/users
```

## Rollback (if needed)

```bash
alembic downgrade -1
```

Or restore from backup:
```bash
psql tumatch_db < backup_YYYYMMDD.sql
```

## Notes

- Make sure PostgreSQL `uuid-ossp` extension is enabled:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

- Update your `.env` or environment variables if database connection changed

- Clear frontend localStorage after switching to real API:
  ```javascript
  localStorage.clear();
  ```
