from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from uuid import UUID
import uvicorn

from database import get_db, engine
from models import Base, User, Event, EventParticipant, Friendship, Moment
from schemas import (
    UserCreate, UserResponse, UserWithEvents,
    EventCreate, EventResponse, EventWithParticipants,
    EventParticipantCreate, EventParticipantResponse,
    FriendshipCreate, FriendshipResponse,
    MomentCreate, MomentResponse
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TUMatch API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= Health Check =============

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# ============= User Endpoints =============

@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all users with optional search"""
    query = db.query(User)

    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.department.ilike(f"%{search}%")
            )
        )

    users = query.offset(skip).limit(limit).all()
    return users

@app.get("/api/users/{user_id}", response_model=UserWithEvents)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get a specific user with their events"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.patch("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: UUID, user_update: UserCreate, db: Session = Depends(get_db)):
    """Update a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """Delete a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return None

# ============= Event Endpoints =============

@app.post("/api/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """Create a new event"""
    # Verify creator exists
    creator = db.query(User).filter(User.id == event.creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/api/events", response_model=List[EventWithParticipants])
def get_events(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    creator_id: Optional[UUID] = None,
    current_user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all events with filters"""
    query = db.query(Event)

    if category:
        query = query.filter(Event.category == category)

    if creator_id:
        query = query.filter(Event.creator_id == creator_id)

    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%"),
                Event.location.ilike(f"%{search}%")
            )
        )

    events = query.offset(skip).limit(limit).all()

    # Populate participant_count and organizer info for each event
    result = []
    for event in events:
        # Get first 3 participants with their user info
        participants_data = []
        for participant in event.participants[:3]:  # Only get first 3 for preview
            if participant.user:
                participants_data.append({
                    "user_id": str(participant.user_id),
                    "name": participant.user.full_name,
                    "photo": participant.user.profile_photo or f"https://api.dicebear.com/7.x/avataaars/svg?seed={participant.user.full_name}"
                })

        event_dict = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "location": event.location,
            "image_url": event.image_url,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "max_participants": event.max_participants,
            "status": event.status,
            "creator_id": event.creator_id,
            "created_at": event.created_at,
            "participant_count": len(event.participants),
            "participants": participants_data,  # Add participant preview
            "organizer_id": event.creator_id,
            "organizer_name": event.creator.full_name if event.creator else None,
            "organizer_photo": event.creator.profile_photo if event.creator else None,
            "organizer_department": event.creator.department if event.creator else None,
            "current_user_joined": any(str(p.user_id) == current_user_id for p in event.participants) if current_user_id else False,
        }
        result.append(event_dict)

    return result

@app.get("/api/events/{event_id}", response_model=EventWithParticipants)
def get_event(event_id: UUID, db: Session = Depends(get_db)):
    """Get a specific event with participants"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Get all participants with their user info for detail view
    participants_data = []
    for participant in event.participants:
        if participant.user:
            participants_data.append({
                "user_id": str(participant.user_id),
                "name": participant.user.full_name,
                "photo": participant.user.profile_photo or f"https://api.dicebear.com/7.x/avataaars/svg?seed={participant.user.full_name}"
            })

    # Populate participant_count and organizer info
    event_dict = {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "location": event.location,
        "image_url": event.image_url,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "max_participants": event.max_participants,
        "status": event.status,
        "creator_id": event.creator_id,
        "created_at": event.created_at,
        "participant_count": len(event.participants),
        "participants": participants_data,  # Include all participants for detail view
        "organizer_id": event.creator_id,
        "organizer_name": event.creator.full_name if event.creator else None,
        "organizer_photo": event.creator.profile_photo if event.creator else None,
        "organizer_department": event.creator.department if event.creator else None,
    }

    return event_dict

@app.patch("/api/events/{event_id}", response_model=EventResponse)
def update_event(event_id: UUID, event_update: EventCreate, db: Session = Depends(get_db)):
    """Update an event"""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: UUID, db: Session = Depends(get_db)):
    """Delete an event"""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()
    return None

# ============= Event Participant Endpoints =============

@app.post("/api/events/{event_id}/join", response_model=EventParticipantResponse, status_code=status.HTTP_201_CREATED)
def join_event(event_id: UUID, participant: EventParticipantCreate, db: Session = Depends(get_db)):
    """Join an event"""
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify user exists
    user = db.query(User).filter(User.id == participant.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already joined
    existing = db.query(EventParticipant).filter(
        and_(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == participant.user_id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this event")

    # Check max participants
    if event.max_participants:
        current_count = db.query(EventParticipant).filter(
            EventParticipant.event_id == event_id
        ).count()
        if current_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Event is full")

    # Create participant with event_id from URL path
    db_participant = EventParticipant(event_id=event_id, user_id=participant.user_id)
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

@app.delete("/api/events/{event_id}/leave/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def leave_event(event_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    """Leave an event"""
    participant = db.query(EventParticipant).filter(
        and_(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == user_id
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    db.delete(participant)
    db.commit()
    return None

@app.get("/api/events/{event_id}/participants", response_model=List[EventParticipantResponse])
def get_event_participants(event_id: UUID, db: Session = Depends(get_db)):
    """Get all participants for an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    participants = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id
    ).all()
    return participants

# ============= Friendship Endpoints =============

@app.post("/api/friendships", response_model=FriendshipResponse, status_code=status.HTTP_201_CREATED)
def create_friendship(friendship: FriendshipCreate, db: Session = Depends(get_db)):
    """Send a friend request"""
    # Verify both users exist
    user = db.query(User).filter(User.id == friendship.user_id).first()
    friend = db.query(User).filter(User.id == friendship.friend_id).first()

    if not user or not friend:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if friendship already exists
    existing = db.query(Friendship).filter(
        or_(
            and_(
                Friendship.user_id == friendship.user_id,
                Friendship.friend_id == friendship.friend_id
            ),
            and_(
                Friendship.user_id == friendship.friend_id,
                Friendship.friend_id == friendship.user_id
            )
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")

    db_friendship = Friendship(**friendship.model_dump())
    db.add(db_friendship)
    db.commit()
    db.refresh(db_friendship)
    return db_friendship

@app.get("/api/users/{user_id}/friendships", response_model=List[FriendshipResponse])
def get_user_friendships(
    user_id: UUID,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all friendships for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Friendship).filter(
        or_(
            Friendship.user_id == user_id,
            Friendship.friend_id == user_id
        )
    )

    if status_filter:
        query = query.filter(Friendship.status == status_filter)

    friendships = query.all()
    return friendships

@app.patch("/api/friendships/{friendship_id}", response_model=FriendshipResponse)
def update_friendship(
    friendship_id: UUID,
    status_update: str,
    db: Session = Depends(get_db)
):
    """Update friendship status (accept/reject)"""
    if status_update not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    friendship.status = status_update
    db.commit()
    db.refresh(friendship)
    return friendship

@app.delete("/api/friendships/{friendship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_friendship(friendship_id: UUID, db: Session = Depends(get_db)):
    """Delete a friendship"""
    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    db.delete(friendship)
    db.commit()
    return None

# ============= Moment Endpoints =============

@app.post("/api/moments", response_model=MomentResponse, status_code=status.HTTP_201_CREATED)
def create_moment(moment: MomentCreate, db: Session = Depends(get_db)):
    """Create a new moment"""
    # Verify user and event exist
    user = db.query(User).filter(User.id == moment.user_id).first()
    event = db.query(Event).filter(Event.id == moment.event_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_moment = Moment(**moment.model_dump())
    db.add(db_moment)
    db.commit()
    db.refresh(db_moment)
    return db_moment

@app.get("/api/moments", response_model=List[MomentResponse])
def get_moments(
    user_id: Optional[UUID] = None,
    event_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get moments with filters"""
    query = db.query(Moment)

    if user_id:
        query = query.filter(Moment.user_id == user_id)

    if event_id:
        query = query.filter(Moment.event_id == event_id)

    moments = query.order_by(Moment.created_at.desc()).offset(skip).limit(limit).all()
    return moments

@app.get("/api/moments/{moment_id}", response_model=MomentResponse)
def get_moment(moment_id: UUID, db: Session = Depends(get_db)):
    """Get a specific moment"""
    moment = db.query(Moment).filter(Moment.id == moment_id).first()
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")
    return moment

@app.delete("/api/moments/{moment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_moment(moment_id: UUID, db: Session = Depends(get_db)):
    """Delete a moment"""
    moment = db.query(Moment).filter(Moment.id == moment_id).first()
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")

    db.delete(moment)
    db.commit()
    return None

# ============= Run Server =============

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
