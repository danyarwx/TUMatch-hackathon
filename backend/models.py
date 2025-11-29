# models.py - Updated to match frontend
from sqlalchemy import Column, Text, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.expression import text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    email = Column(Text, nullable=False, unique=True)
    full_name = Column(Text, nullable=False)
    profile_photo = Column(Text, nullable=True)  # Changed from avatar_url
    department = Column(Text, nullable=True)  # Added for frontend
    bio = Column(Text, nullable=True)  # Added for user profiles
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    events_created = relationship("Event", back_populates="creator")
    event_participations = relationship("EventParticipant", back_populates="user")
    friendships_initiated = relationship("Friendship", foreign_keys="Friendship.user_id", back_populates="user")
    friendships_received = relationship("Friendship", foreign_keys="Friendship.friend_id", back_populates="friend")
    moments = relationship("Moment", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Text, nullable=False)
    location = Column(Text, nullable=False)  # Changed from location_text
    image_url = Column(Text, nullable=True)  # Added for event images
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=True)
    max_participants = Column(Integer, nullable=True)
    status = Column(Text, nullable=False, server_default=text("'active'"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="events_created")
    participants = relationship("EventParticipant", back_populates="event", cascade="all, delete-orphan")
    moments = relationship("Moment", back_populates="event")


class EventParticipant(Base):
    __tablename__ = "event_participants"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    status = Column(Text, nullable=False, server_default=text("'joined'"))

    # Relationships
    user = relationship("User", back_populates="event_participations")
    event = relationship("Event", back_populates="participants")


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Text, nullable=False, server_default=text("'pending'"))  # pending, accepted, rejected
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="friendships_initiated")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="friendships_received")


class Moment(Base):
    __tablename__ = "moments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(Text, nullable=False)
    caption = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="moments")
    event = relationship("Event", back_populates="moments")
