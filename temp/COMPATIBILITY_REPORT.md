# Database-Frontend Compatibility Report

## 🔴 Critical Mismatches

### 1. **Event Model Differences**

#### Backend (models.py)
```python
- creator_id (UUID, FK to users)
- location_text (Text)
- end_time (TIMESTAMP)
- status (Text, default='active')
```

#### Frontend (Event.json / base44Client.ts)
```typescript
- organizer_id (string)
- organizer_name (string)
- organizer_photo (string)
- organizer_department (string)
- location (string)  ❌ Named differently
- image_url (string)  ❌ Missing in backend
- participants (array)  ❌ Stored differently
```

**Issues:**
- ❌ `location_text` (backend) vs `location` (frontend)
- ❌ `creator_id` (backend) vs `organizer_id` (frontend)
- ❌ Missing `image_url` field in backend
- ❌ Missing `end_time` in frontend
- ❌ `participants` array in frontend but separate table in backend

---

### 2. **User Model Differences**

#### Backend (models.py)
```python
- avatar_url (Text)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Frontend (base44Client.ts)
```typescript
- profile_photo (string)  ❌ Named differently
- department (string)  ❌ Missing in backend
```

**Issues:**
- ❌ `avatar_url` (backend) vs `profile_photo` (frontend)
- ❌ Missing `department` field in backend

---

### 3. **Missing Tables**

#### ❌ **Friendship Table** - Not in backend
Frontend expects:
```json
{
  "user_id": "string",
  "friend_id": "string",
  "friend_name": "string",
  "friend_photo": "string",
  "status": "pending|accepted"
}
```

#### ❌ **Moment Table** - Not in backend
Frontend expects:
```json
{
  "event_id": "string",
  "event_title": "string",
  "photo_url": "string",
  "location": "string",
  "event_date": "datetime",
  "attendees": [...]
}
```

---

## 📋 Required Backend Updates

### 1. Update Event Model

```python
class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Text, nullable=False)
    location = Column(Text, nullable=False)  # ✅ Changed from location_text
    image_url = Column(Text, nullable=True)  # ✅ Added
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=True)  # ✅ Made optional
    max_participants = Column(Integer, nullable=True)
    status = Column(Text, nullable=False, server_default=text("'active'"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="events_created")
    participants = relationship("EventParticipant", back_populates="event")
```

### 2. Update User Model

```python
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    email = Column(Text, nullable=False, unique=True)
    full_name = Column(Text, nullable=False)
    profile_photo = Column(Text, nullable=True)  # ✅ Changed from avatar_url
    department = Column(Text, nullable=True)  # ✅ Added
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    events_created = relationship("Event", back_populates="creator")
    event_participations = relationship("EventParticipant", back_populates="user")
    friendships_initiated = relationship("Friendship", foreign_keys="Friendship.user_id", back_populates="user")
    friendships_received = relationship("Friendship", foreign_keys="Friendship.friend_id", back_populates="friend")
    moments = relationship("Moment", back_populates="user")
```

### 3. Add Friendship Model

```python
class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Text, nullable=False, server_default=text("'pending'"))  # pending, accepted, rejected
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="friendships_initiated")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="friendships_received")
```

### 4. Add Moment Model

```python
class Moment(Base):
    __tablename__ = "moments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(Text, nullable=False)
    caption = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="moments")
    event = relationship("Event")
```

---

## 🔧 Required Schema Updates

### Update EventBase Schema

```python
class EventBase(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    category: str
    location: str  # ✅ Changed from location_text
    image_url: Optional[str] = None  # ✅ Added
    start_time: datetime
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: str
    creator_id: UUID

    # Add computed fields for frontend compatibility
    organizer_id: Optional[UUID] = None
    organizer_name: Optional[str] = None
    organizer_photo: Optional[str] = None
    organizer_department: Optional[str] = None
    participants: list = []

    class Config:
        orm_mode = True
```

### Add UserBase Schema Update

```python
class UserBase(BaseModel):
    id: UUID
    email: str
    full_name: str
    profile_photo: Optional[str] = None  # ✅ Changed from avatar_url
    department: Optional[str] = None  # ✅ Added
    created_at: datetime

    class Config:
        orm_mode = True
```

### Add New Schemas

```python
class FriendshipBase(BaseModel):
    id: UUID
    user_id: UUID
    friend_id: UUID
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class MomentBase(BaseModel):
    id: UUID
    user_id: UUID
    event_id: UUID
    photo_url: str
    caption: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
```

---

## 📊 Summary

### Critical Changes Needed:
1. ✅ Rename `location_text` → `location` in Event model
2. ✅ Rename `avatar_url` → `profile_photo` in User model
3. ✅ Add `image_url` field to Event model
4. ✅ Add `department` field to User model
5. ✅ Add `Friendship` model and table
6. ✅ Add `Moment` model and table
7. ✅ Update all schemas to match frontend expectations
8. ✅ Add API endpoints for friendships and moments

### API Endpoints to Add:
- `GET /api/events` - List events with participants
- `POST /api/events` - Create event
- `GET /api/events/{id}` - Get event details
- `POST /api/events/{id}/join` - Join event
- `GET /api/users/{id}` - Get user profile
- `GET /api/friendships` - List friendships
- `POST /api/friendships` - Create friendship
- `GET /api/moments` - List moments
- `POST /api/moments` - Create moment

---

## 🎯 Next Steps

1. **Update models.py** with all changes above
2. **Create migration** using Alembic
3. **Update schemas.py** with new field names
4. **Add missing API endpoints** in main.py
5. **Update frontend** to use real API instead of localStorage
6. **Test compatibility** with Postman/curl

Would you like me to generate the updated files?
