// Real backend API client
const API_BASE_URL = 'http://localhost:8000/api';

interface JoinEventParams {
  event_id: string;
  user_id: string;
}

interface CreateEventParams {
  title: string;
  description?: string;
  category: string;
  location: string;
  image_url?: string;
  start_time: string;
  end_time?: string;
  max_participants?: number;
  creator_id: string;
}

interface CreateMomentParams {
  user_id: string;
  event_id: string;
  photo_url: string;
  caption?: string;
}

interface CreateFriendshipParams {
  user_id: string;
  friend_id: string;
}

export const apiClient = {
  // ============= USER ENDPOINTS =============

  async getCurrentUser() {
    // For now, return the mock current user
    // In production, this would validate JWT and return actual user
    return {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'current@tum.de',
      full_name: 'Omar Azlan',
      profile_photo: '/pfpics/omar.jpg',
      department: 'BMDS',
      bio: 'This is the current logged-in user',
    };
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUser(user_id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${user_id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // ============= EVENT ENDPOINTS =============

  async getEvents(filters?: { category?: string; search?: string; creator_id?: string; current_user_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.creator_id) params.append('creator_id', filters.creator_id);
    if (filters?.current_user_id) params.append('current_user_id', filters.current_user_id);

    const url = `${API_BASE_URL}/events${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch events');
    }

    return response.json();
  },

  async getEvent(event_id: string) {
    const response = await fetch(`${API_BASE_URL}/events/${event_id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch event');
    }

    return response.json();
  },

  async createEvent(event: CreateEventParams) {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create event');
    }

    return response.json();
  },

  // ============= EVENT PARTICIPANT ENDPOINTS =============

  async joinEvent({ event_id, user_id }: JoinEventParams) {
    const response = await fetch(`${API_BASE_URL}/events/${event_id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id,
        user_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to join event');
    }

    return response.json();
  },

  async leaveEvent({ event_id, user_id }: JoinEventParams) {
    const response = await fetch(`${API_BASE_URL}/events/${event_id}/leave/${user_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to leave event';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // DELETE returns 204 No Content, no body to parse
    return null;
  },

  async getEventParticipants(event_id: string) {
    const response = await fetch(`${API_BASE_URL}/events/${event_id}/participants`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch participants');
    }

    return response.json();
  },

  // ============= FRIENDSHIP ENDPOINTS =============

  async getFriendships(user_id: string, status_filter?: string) {
    const params = new URLSearchParams();
    if (status_filter) params.append('status_filter', status_filter);

    const url = `${API_BASE_URL}/users/${user_id}/friendships${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch friendships');
    }

    return response.json();
  },

  async createFriendship(data: CreateFriendshipParams) {
    const response = await fetch(`${API_BASE_URL}/friendships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create friendship');
    }

    return response.json();
  },
  async deleteFriendship(friendship_id: string) {
    const response = await fetch(`${API_BASE_URL}/friendships/${friendship_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to delete friendship';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return null; // DELETE returns 204 No Content
  },

  // ============= MOMENT ENDPOINTS =============

  async getMoments(user_id?: string, event_id?: string) {
    const params = new URLSearchParams();
    if (user_id) params.append('user_id', user_id);
    if (event_id) params.append('event_id', event_id);

    const url = `${API_BASE_URL}/moments${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch moments');
    }

    return response.json();
  },

  async createMoment(data: CreateMomentParams) {
    const response = await fetch(`${API_BASE_URL}/moments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create moment');
    }

    return response.json();
  },

  // ============= ADMIN / MANAGEMENT =============
  async deleteEvent(event_id: string) {
    const response = await fetch(`${API_BASE_URL}/events/${event_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to delete event';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // DELETE returns 204 No Content
    return null;
  },
};

