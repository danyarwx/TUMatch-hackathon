# schemas.py - Updated to match frontend expectations
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

# ---------- USER SCHEMAS ----------

class UserCreate(BaseModel):
    email: str
    full_name: str
    profile_photo: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None


class UserBase(BaseModel):
    id: UUID
    email: str
    full_name: str
    profile_photo: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class ParticipantInfo(BaseModel):
    """Nested participant info for event responses"""
    user_id: UUID
    name: str
    photo: Optional[str] = None


# ---------- EVENT SCHEMAS ----------

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    location: str
    image_url: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = None


class EventBase(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    category: str
    location: str
    image_url: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: str
    creator_id: UUID
    created_at: datetime

    # Frontend compatibility fields
    organizer_id: Optional[UUID] = None
    organizer_name: Optional[str] = None
    organizer_photo: Optional[str] = None
    organizer_department: Optional[str] = None
    participants: List[ParticipantInfo] = []

    class Config:
        orm_mode = True


# ---------- EVENT PARTICIPANT SCHEMAS ----------

class EventParticipantCreate(BaseModel):
    event_id: UUID
    user_id: UUID


class EventParticipantBase(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    joined_at: datetime
    status: str

    class Config:
        orm_mode = True


# ---------- FRIENDSHIP SCHEMAS ----------

class FriendshipCreate(BaseModel):
    friend_id: UUID


class FriendshipBase(BaseModel):
    id: UUID
    user_id: UUID
    friend_id: UUID
    status: str
    created_at: datetime

    # Frontend compatibility
    friend_name: Optional[str] = None
    friend_photo: Optional[str] = None

    class Config:
        orm_mode = True


# ---------- MOMENT SCHEMAS ----------

class MomentCreate(BaseModel):
    event_id: UUID
    photo_url: str
    caption: Optional[str] = None


class MomentBase(BaseModel):
    id: UUID
    user_id: UUID
    event_id: UUID
    photo_url: str
    caption: Optional[str] = None
    created_at: datetime

    # Frontend compatibility fields
    event_title: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    attendees: List[ParticipantInfo] = []

    class Config:
        orm_mode = True


# Response aliases for API endpoints
UserResponse = UserBase
UserWithEvents = UserBase
EventResponse = EventBase
EventWithParticipants = EventBase
EventParticipantResponse = EventParticipantBase
FriendshipResponse = FriendshipBase
MomentResponse = MomentBase
