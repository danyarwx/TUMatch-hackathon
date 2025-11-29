# Complete Database Migration Plan

## Current Status
- ✅ Database schema created (users, events, event_participants, friendships, moments)
- ✅ Backend API endpoints exist
- ✅ Join/unjoin integrated with database
- ❌ Database is EMPTY (no users, no events)
- ❌ All other operations still use localStorage (base44Client)

## What Still Uses localStorage (base44Client)

### 1. **Authentication** (`base44.auth.me()`)
- Used in: Feed, EventDetails, CreateEvent, Profile, UserProfile
- Returns mock current user from localStorage
- **Fix**: Need real authentication or session management

### 2. **Events** (`base44.entities.Event`)
- `list()` - Get all events
- `filter()` - Get event by ID
- `create()` - Create new event
- `update()` - Update event (currently only for participants)
- **Fix**: Replace with `apiClient.getEvents()`, `apiClient.getEvent()`, `apiClient.createEvent()`

### 3. **Moments** (`base44.entities.Moment`)
- `filter()` - Get user's moments
- **Fix**: Replace with `apiClient.getMoments()`

### 4. **Friendships** (`base44.entities.Friendship`)
- `filter()` - Get user's friends
- **Fix**: Replace with `apiClient.getFriendships()`

### 5. **File Upload** (`base44.integrations.Core.UploadFile`)
- Used in CreateEvent for image upload
- **Fix**: Need real file upload endpoint or cloud storage

## Migration Steps

### Phase 1: Seed Database with Initial Data ✅
1. Create sample users
2. Create sample events
3. Create sample friendships
4. Create sample moments

### Phase 2: Expand API Client ✅
1. Add user endpoints
2. Add event CRUD operations
3. Add moments endpoints
4. Add friendships endpoints
5. Add file upload (or use placeholder URLs)

### Phase 3: Update All Pages 🔄
1. Feed.tsx - Use real API for events
2. EventDetails.tsx - Use real API for event details
3. CreateEvent.tsx - Use real API to create events
4. Profile.tsx - Use real API for user data
5. UserProfile.tsx - Use real API for user profiles

### Phase 4: Remove localStorage Mock ✅
1. Keep base44Client.ts for reference
2. Update all imports to use apiClient
3. Remove localStorage usage

### Phase 5: Authentication 🔄
1. Add login/signup pages
2. Store JWT token
3. Add auth middleware to backend
4. Protect routes

## Detailed Action Items

### 1. Seed Script
```sql
-- Create test users
INSERT INTO users (email, full_name, profile_photo, department, bio)
VALUES
  ('alex@tum.de', 'Alex Müller', 'https://...', 'Computer Science', 'Passionate about AI'),
  ('sara@tum.de', 'Sara Chen', 'https://...', 'Mechanical Engineering', 'Love robotics'),
  ('lisa@tum.de', 'Lisa Wang', 'https://...', 'Physics', 'Quantum computing enthusiast');

-- Create test events
INSERT INTO events (creator_id, title, description, category, location, start_time, max_participants)
VALUES
  (...);
```

### 2. API Client Methods to Add
- `getUsers()`
- `getUser(id)`
- `createUser()`
- `createEvent()`
- `updateEvent(id, data)`
- `deleteEvent(id)`
- `getMoments(userId?)`
- `createMoment(data)`
- `getFriendships(userId)`
- `createFriendship(data)`

### 3. Pages to Update
Each page needs:
- Remove `import { base44 }`
- Add `import { apiClient }`
- Replace all `base44.entities.X` with `apiClient.X`
- Handle loading/error states
- Update queries to use new endpoints

## Priority Order
1. **HIGH**: Seed database with test data
2. **HIGH**: Expand apiClient with all operations
3. **HIGH**: Update Feed.tsx (most visible)
4. **HIGH**: Update EventDetails.tsx (already partially done)
5. **MEDIUM**: Update CreateEvent.tsx
6. **MEDIUM**: Update Profile.tsx
7. **MEDIUM**: Update UserProfile.tsx
8. **LOW**: Add authentication
9. **LOW**: Remove base44Client

## Estimated Time
- Seed database: 30 min
- Expand API client: 1 hour
- Update pages: 2-3 hours
- Testing: 1 hour
- **Total**: 4-5 hours

## Success Criteria
✅ No localStorage usage
✅ All data persisted in PostgreSQL
✅ All CRUD operations work through API
✅ No console errors
✅ Participant counts accurate
✅ Events persist across page reloads
✅ User data consistent

---

**Status**: Planning Complete - Ready to Execute
**Next**: Start with database seeding
